import { invoke } from "@tauri-apps/api";

import StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import Stateful, { type UnsubscribeFn } from "../../../architecture/Stateful";
import {
    getChildren,
    getGrandparent,
    getIndex,
    getParent,
    getPosition,
    isPositionOnPath,
} from "../../../architecture/state-hierarchy-utils";
import purifyArrays from "../../../utils/purifyArrays";
import { Chord } from "../../models/item/Chord";
import type { ItemState } from "../../models/item/Item";
import Item from "../../models/item/Item";
import type { ItemTypes } from "../../models/item/ItemTypes";
import type Timeline from "../../models/timeline/Timeline";
import type Track from "../../models/track/Track";
import type TrackGroup from "../../models/track_group/TrackGroup";
import type Voice from "../../models/voice/Voice";
import type Interval from "../../../utils/interval/Interval";

import { getTrackType, getTracksOfType } from "./track-config";

const MIN_DURATION = 0.03125;

export default class Generator {
    private _itemChanges: ItemChange[] = [];
    private _isHandlingChanges = false;

    private _frameworkMap = new FrameworkMap({});

    private _getFramework(voice: Voice): readonly NoteBuilder[] {
        let framework = this._frameworkMap.state[voice.id];
        if (!framework) {
            framework = [];
            this._frameworkMap.state = {
                [voice.id]: framework,
            };
        }
        return framework;
    }

    private _decorationsMap = new Map<
        TrackGroup,
        Map<NoteBuilder, Decoration>
    >();

    private _getDecorations(trackGroup: TrackGroup) {
        let decorations = this._decorationsMap.get(trackGroup);
        if (!decorations) {
            decorations = new Map();
            this._decorationsMap.set(trackGroup, decorations);
        }
        return decorations;
    }

    private _timeline: Timeline;

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        this._timeline = watcher.root;

        watcher.subscribe((obj, oldState) => {
            const position = getPosition(obj);
            const newState = obj.state as any;

            if (!isPositionOnPath(position, "1")) return; // Return if object not in second VoiceGroup

            switch (position.length) {
                // Track
                case 4: {
                    const trackType = getTrackType(obj as Track<any>);
                    if (trackType === "output" || !trackType) return;

                    const [removedItems, addedItems] = purifyArrays<Item<any>>(
                        oldState.children,
                        newState.children
                    );

                    this._itemChanges.push(
                        ...removedItems.map((item) => {
                            return {
                                obj: item,
                                oldState: item.state,
                                newState: undefined,
                            };
                        }),
                        ...addedItems.map((item) => {
                            return {
                                obj: item,
                                oldState: undefined,
                                newState: item.state,
                            };
                        })
                    );
                    break;
                }
                // Item
                case 5: {
                    const trackType = getTrackType(getParent(obj as Item<any>));
                    if (trackType === "output" || !trackType) return;

                    const isValidChange = ["start", "end", "content"].some(
                        (key) => oldState[key] !== newState[key]
                    );

                    if (isValidChange) {
                        this._itemChanges.push({ obj, oldState, newState });
                    }
                    break;
                }
            }

            if (this._itemChanges.length > 0 && !this._isHandlingChanges) {
                const handleNextChangeLoop = () => {
                    const nextChange = this._itemChanges.shift();

                    if (nextChange) {
                        this._handleChange(nextChange).then(
                            handleNextChangeLoop
                        );
                    } else {
                        this._isHandlingChanges = false;
                        //render output
                        const voices = getChildren(
                            getChildren(this._timeline)[1]
                        );
                        for (const voice of voices) this._renderOutput(voice);
                    }
                };
                this._isHandlingChanges = true;
                handleNextChangeLoop();
            }
        });
    }

    private async _handleChange(change: ItemChange) {
        const subscriptions: UnsubscribeFn[] = [];

        const updatedNotes = new Set<NoteBuilder>();

        Object.values(this._frameworkMap.state).forEach((framework) =>
            framework.forEach((note, index) => {
                const unsubscribe = note.subscribe(() => {
                    updatedNotes.add(note);
                    const prevNote = framework[index - 1];
                    if (prevNote) updatedNotes.add(prevNote);
                });
                subscriptions.push(unsubscribe);
            })
        );

        subscriptions.push(
            this._frameworkMap.subscribe((oldState, newState) => {
                const voiceIds = new Set([
                    ...Object.keys(oldState),
                    ...Object.keys(newState),
                ]);

                voiceIds.forEach((voiceId) => {
                    const oldFramework = oldState[voiceId];
                    const newFramework = newState[voiceId];

                    if (oldFramework === newFramework) return;

                    const [removedNotes, addedNotes] = !oldFramework
                        ? [[], newFramework.slice()]
                        : !newFramework
                        ? [oldFramework.slice(), []]
                        : purifyArrays(oldFramework, newFramework);

                    removedNotes.forEach((note) => {
                        updatedNotes.add(note);
                        const prevNote =
                            oldFramework[oldFramework.indexOf(note) - 1];
                        if (prevNote) updatedNotes.add(prevNote);
                    });

                    addedNotes.forEach((note) => {
                        updatedNotes.add(note);
                        const prevNote =
                            newFramework[newFramework.indexOf(note) - 1];
                        if (prevNote) updatedNotes.add(prevNote);
                    });
                });
            })
        );

        if (change.oldState) {
            await this._clearItemStateEffect(change.oldState);
        }
        if (change.newState) {
            const error = await this._applyItemStateEffect(change.newState);
            change.obj.state = { error };
        }

        subscriptions.forEach((unsubscribe) => unsubscribe());

        const decorationMapEntries = this._decorationsMap.entries();
        const owningItems = new Set<Item<any>>();

        for (const [trackGroup, decorations] of decorationMapEntries) {
            const voice = getParent(trackGroup);
            const framework = this._frameworkMap.state[voice.id];

            if (!framework) continue;

            const tracks = [
                getTracksOfType(trackGroup, "decorationPitches")[0],
                getTracksOfType(trackGroup, "decorationFraction")[0],
                getTracksOfType(trackGroup, "decorationSkip")[0],
            ];

            for (const note of updatedNotes) {
                const index = framework.indexOf(note);

                if (index === -1) {
                    decorations.delete(note);
                    continue;
                }

                const nextNote = framework[index + 1];

                if (!nextNote) {
                    decorations.delete(note);
                    continue;
                }

                tracks
                    .map((track) =>
                        getChildren(track).find((item) =>
                            isPointWithinInterval(note.state.start, item.state)
                        )
                    )
                    .filter((value): value is Item<any> => value !== undefined)
                    .forEach((item) => owningItems.add(item));
            }
        }

        const promises = [];

        for (const item of owningItems) {
            promises.push(this._applyItemStateEffect(item.state));
        }

        await Promise.all(promises);
    }

    private async _clearItemStateEffect(itemState: ItemState<any>) {
        const trackType = getTrackType(itemState.parent);
        const voice = getGrandparent(itemState.parent);

        const voiceNotes = this._getFramework(voice).slice();
        const ownedNotes = getNotesStartingWithinInterval(
            voiceNotes,
            itemState
        );

        if (ownedNotes.length === 0) return;

        const getOwnedDecorations = () => {
            const decorations = this._getDecorations(
                getParent(itemState.parent)
            );
            return ownedNotes
                .slice(0, -1)
                .map((note) => decorations.get(note))
                .filter((value): value is Decoration => {
                    return value !== undefined;
                });
        };

        switch (trackType) {
            case "frameworkPitch": {
                ownedNotes.forEach((note) => {
                    note.state = { degree: undefined, pitch: undefined };
                });
                break;
            }
            case "frameworkRest": {
                ownedNotes.forEach((note) => {
                    note.state = { isRest: undefined };
                });
                break;
            }
            case "frameworkHarmony": {
                ownedNotes.forEach((note) => {
                    note.state = { pitch: undefined };
                });
                break;
            }
            case "frameworkDuration": {
                ownedNotes.forEach((note) => {
                    voiceNotes.splice(voiceNotes.indexOf(note), 1);
                });

                this._frameworkMap.state = { [voice.id]: voiceNotes };

                const durationItems = getChildren(itemState.parent).slice();
                durationItems.sort((a, b) => a.state.start - b.state.start);

                // TODO: Use binary search here instead
                const nextDurationItem = durationItems.find(
                    (item) => item.state.start >= itemState.end
                );

                if (nextDurationItem) {
                    nextDurationItem.state = {
                        error: await this._applyItemStateEffect(
                            nextDurationItem.state
                        ),
                    };
                }
                break;
            }
            case "decorationPitches": {
                getOwnedDecorations().forEach((decoration) => {
                    decoration.pitches = undefined;
                });
                break;
            }
            case "decorationFraction": {
                getOwnedDecorations().forEach((decoration) => {
                    decoration.fraction = undefined;
                });
                break;
            }
            case "decorationSkip": {
                getOwnedDecorations().forEach((decoration) => {
                    decoration.skip = undefined;
                });
                break;
            }
            case "decorationHarmony": {
                getOwnedDecorations().forEach((decoration) => {
                    decoration.pitches = undefined;
                });
                break;
            }
        }
    }

    private async _applyItemStateEffect(
        itemState: ItemState<any>
    ): Promise<string | undefined> {
        const trackType = getTrackType(itemState.parent);
        const voice = getGrandparent(itemState.parent);

        const voiceNotes = this._getFramework(voice).slice();
        const ownedNotes = getNotesStartingWithinInterval(
            voiceNotes,
            itemState
        );

        if (itemState.content === "") return;

        switch (trackType) {
            case "frameworkPitch": {
                const promises = [];

                for (let i = 0; i < ownedNotes.length; i++) {
                    const promise = (async () => {
                        const args = { ...this._timeline.state.aliases, x: i };
                        const jsonArgs = JSON.stringify(args);

                        const result = await invoke("evaluate", {
                            task: `eval ||| ${itemState.content} ||| ${jsonArgs}`,
                        });

                        return Math.round(Number(result));
                    })();
                    promises.push(promise);
                }

                const values = await Promise.all(promises);

                for (const value of values) {
                    if (isNaN(value)) {
                        return "Failed to evaluate to a number";
                    }
                }

                for (let i = 0; i < ownedNotes.length; i++) {
                    ownedNotes[i].state = { degree: values[i] };
                }

                // Recalculate pitch based on harmony for ownedNotes
                const voice = getGrandparent(itemState.parent);
                const [harmonyTrack] = getTracksOfType(
                    voice,
                    "frameworkHarmony"
                );

                ownedNotes.forEach((note) => {
                    const harmonyItem = getChildren(harmonyTrack).find((item) =>
                        isPointWithinInterval(note.state.start, item.state)
                    );
                    if (!harmonyItem) return;
                    note.state = {
                        pitch: getPitchFromChordStatusAndDegree(
                            harmonyItem.state.content.chordStatus,
                            note.state.degree
                        ),
                    };
                });
                break;
            }
            case "frameworkRest": {
                const promises = [];

                for (let i = 0; i < ownedNotes.length; i++) {
                    const promise = (async () => {
                        const args = { ...this._timeline.state.aliases, x: i };
                        const jsonArgs = JSON.stringify(args);

                        const result: string = await invoke("evaluate", {
                            task: `eval ||| ${itemState.content} ||| ${jsonArgs}`,
                        });

                        return result.trim();
                    })();
                    promises.push(promise);
                }

                const results = await Promise.all(promises);

                for (const result of results) {
                    if (result !== "true" && result !== "false") {
                        return "Failed to evaluate to a boolean";
                    }
                }

                for (let i = 0; i < ownedNotes.length; i++) {
                    ownedNotes[i].state = {
                        isRest: results[i] === "true",
                    };
                }

                break;
            }
            case "frameworkHarmony": {
                const ownedNotes = getNotesStartingWithinInterval(
                    voiceNotes,
                    itemState
                );
                ownedNotes.forEach((note) => {
                    note.state = {
                        pitch: getPitchFromChordStatusAndDegree(
                            itemState.content.chordStatus,
                            note.state.degree
                        ),
                    };
                });
                break;
            }
            case "frameworkDuration": {
                ownedNotes.forEach((note) => {
                    voiceNotes.splice(voiceNotes.indexOf(note), 1);
                });

                const firstOverlappingNote = voiceNotes.find((note) => {
                    return (
                        note.state.start < itemState.start &&
                        note.state.end > itemState.start
                    );
                });

                let beat = firstOverlappingNote
                    ? Math.max(itemState.start, firstOverlappingNote.state.end)
                    : itemState.start;
                let index = 0;
                let skippedIndeces = 0;

                const newNotes: NoteBuilder[] = [];

                while (beat < itemState.end) {
                    const args = { ...this._timeline.state.aliases, x: index };
                    const jsonArgs = JSON.stringify(args);

                    const result = await invoke("evaluate", {
                        task: `eval ||| ${itemState.content} ||| ${jsonArgs}`,
                    });

                    index++;

                    const parsedResult = Number(result);

                    if (isNaN(parsedResult)) {
                        return "Failed to evaluate to a number";
                    }

                    const duration = roundToNearestMultiple(
                        Math.abs(parsedResult),
                        2
                    );

                    if (duration < MIN_DURATION) {
                        if (skippedIndeces === 3) {
                            return "Failed to return a large enough value too many times";
                        } else {
                            skippedIndeces++;
                            continue;
                        }
                    }
                    skippedIndeces = 0;

                    newNotes.push(
                        new NoteBuilder({
                            start: beat,
                            end: beat + duration,
                        })
                    );
                    beat += duration;
                }

                voiceNotes.push(...newNotes);
                voiceNotes.sort((a, b) => a.state.start - b.state.end);
                this._frameworkMap.state = { [voice.id]: voiceNotes };

                const durationItems = getChildren(itemState.parent).slice();
                durationItems.sort((a, b) => a.state.start - b.state.start);

                // TODO: Use binary search here instead
                const nextDurationItem = durationItems.find(
                    (item) => item.state.start >= itemState.end
                );

                if (nextDurationItem) {
                    nextDurationItem.state = {
                        error: await this._applyItemStateEffect(
                            nextDurationItem.state
                        ),
                    };
                }

                await this._remakePropertiesForNotes(voice, newNotes);
                break;
            }
            case "decorationPitches": {
                const trackGroup = getParent(itemState.parent);
                const decorations = this._getDecorations(trackGroup);

                const [harmonyTrack] = getTracksOfType(
                    trackGroup,
                    "decorationHarmony"
                );

                const indeces = ownedNotes
                    .slice(0, -1)
                    .map((note) => voiceNotes.indexOf(note));

                const promises = [];

                for (const index of indeces) {
                    const prevNote = voiceNotes[index];
                    const nextNote = voiceNotes[index + 1];

                    if (
                        prevNote.state.pitch === undefined ||
                        nextNote.state.pitch === undefined ||
                        prevNote.state.isRest ||
                        nextNote.state.isRest
                    ) {
                        continue;
                    }

                    const harmonyItem = getChildren(harmonyTrack).find((item) =>
                        isPointWithinInterval(prevNote.state.start, item.state)
                    );

                    const harmony = ((): Chord => {
                        if (
                            harmonyItem &&
                            harmonyItem.state.content.chordStatus instanceof
                                Chord
                        ) {
                            return harmonyItem.state.content.chordStatus;
                        }
                        return Chord.fromDecimal("A", 4095);
                    })();

                    const prevDegree = harmony.midiToDegree(
                        prevNote.state.pitch
                    );
                    const nextDegree = harmony.midiToDegree(
                        nextNote.state.pitch
                    );

                    const args = JSON.stringify({
                        ...this._timeline.state.aliases,
                        prev_degree: prevDegree,
                        next_degree: nextDegree,
                    });

                    const promise = (async () => {
                        const result: string = await invoke("evaluate", {
                            task: `eval ||| ${itemState.content} ||| ${args}`,
                        });

                        const parsedResult: number | number[] | null =
                            JSON.parse(result);

                        if (
                            !Number.isInteger(parsedResult) &&
                            !isIntegerArray(parsedResult) &&
                            parsedResult !== null
                        ) {
                            throw new Error("Failed to evaluate pitches");
                        }

                        const degrees =
                            parsedResult !== null
                                ? [parsedResult].flat() // In case pitches evaluate to a single integer
                                : [];

                        const pitches = degrees.map((degree) =>
                            harmony.degreeToMidi(degree)
                        );

                        return pitches;
                    })();

                    promises.push(promise);
                }

                const results = await Promise.all(promises);

                for (let i = 0; i < results.length; i++) {
                    const pitches = results[i];

                    const decoration = decorations.get(ownedNotes[i]);

                    decorations.set(
                        ownedNotes[i],
                        decoration ? { ...decoration, pitches } : { pitches }
                    );
                }
                break;
            }
            case "decorationFraction": {
                const trackGroup = getParent(itemState.parent);
                const decorations = this._getDecorations(trackGroup);

                const indeces = ownedNotes
                    .slice(0, -1)
                    .map((note) => voiceNotes.indexOf(note));

                const promises = [];

                for (const index of indeces) {
                    const prevNote = voiceNotes[index];
                    const nextNote = voiceNotes[index + 1];

                    if (
                        prevNote.state.pitch === undefined ||
                        nextNote.state.pitch === undefined ||
                        prevNote.state.isRest ||
                        nextNote.state.isRest
                    ) {
                        continue;
                    }

                    const args = JSON.stringify({
                        ...this._timeline.state.aliases,
                    });

                    const promise = (async () => {
                        const result: string = await invoke("evaluate", {
                            task: `eval ||| ${itemState.content} ||| ${args}`,
                        });

                        const parsedResult = JSON.parse(result);

                        if (isNaN(parsedResult)) {
                            throw new Error("Failed to evaluate fraction");
                        }

                        return Math.round(parsedResult);
                    })();

                    promises.push(promise);
                }

                const results = await Promise.all(promises);

                for (let i = 0; i < results.length; i++) {
                    const fraction = results[i];

                    const decoration = decorations.get(ownedNotes[i]);

                    decorations.set(
                        ownedNotes[i],
                        decoration ? { ...decoration, fraction } : { fraction }
                    );
                }
                break;
            }
            case "decorationSkip": {
                const trackGroup = getParent(itemState.parent);
                const decorations = this._getDecorations(trackGroup);

                const indeces = ownedNotes
                    .slice(0, -1)
                    .map((note) => voiceNotes.indexOf(note));

                const promises = [];

                for (const index of indeces) {
                    const prevNote = voiceNotes[index];
                    const nextNote = voiceNotes[index + 1];

                    if (
                        prevNote.state.pitch === undefined ||
                        nextNote.state.pitch === undefined ||
                        prevNote.state.isRest ||
                        nextNote.state.isRest
                    ) {
                        continue;
                    }

                    const args = JSON.stringify({
                        ...this._timeline.state.aliases,
                    });

                    const promise = (async () => {
                        const result: string = await invoke("evaluate", {
                            task: `eval ||| ${itemState.content} ||| ${args}`,
                        });

                        const parsedResult = JSON.parse(result);

                        if (parsedResult != "true" && parsedResult != "false") {
                            throw new Error("Failed to evaluate skip");
                        }

                        return parsedResult == "true";
                    })();

                    promises.push(promise);
                }

                const results = await Promise.all(promises);

                for (let i = 0; i < results.length; i++) {
                    const skip = results[i];

                    const decoration = decorations.get(ownedNotes[i]);

                    decorations.set(
                        ownedNotes[i],
                        decoration ? { ...decoration, skip } : { skip }
                    );
                }
                break;
            }
            case "decorationHarmony": {
                // Reapply "pitches" items for owned decorations

                const trackGroup = getParent(itemState.parent);

                const [pitchesTrack] = getTracksOfType(
                    trackGroup,
                    "decorationPitches"
                );

                const promises = [];

                for (const note of ownedNotes.slice(0, -1)) {
                    const pitchesItem = pitchesTrack.state.children.find(
                        (item) =>
                            isPointWithinInterval(note.state.start, item.state)
                    );
                    if (pitchesItem) {
                        const promise = this._applyItemStateEffect(
                            pitchesItem.state
                        );
                        promises.push(promise);
                    }
                }
                await Promise.all(promises);
                break;
            }
        }
    }

    private async _remakePropertiesForNotes(
        voice: Voice,
        notes: NoteBuilder[]
    ) {
        const [pitchTrack] = getTracksOfType(voice, "frameworkPitch");
        const [restTrack] = getTracksOfType(voice, "frameworkRest");
        const [harmonyTrack] = getTracksOfType(voice, "frameworkHarmony");

        // Find all pitch, rest, and harmony items that "own" one or more of the notes
        const items = [pitchTrack, restTrack, harmonyTrack].flatMap((track) => {
            return getChildren(track).filter((item) => {
                return notes.find((note) => {
                    return isPointWithinInterval(note.state.start, item.state);
                });
            });
        });

        const promises = [];

        for (const item of items) {
            const promise = (async () => {
                item.state = {
                    error: await this._applyItemStateEffect(item.state),
                };
            })();
            promises.push(promise);
        }
        await Promise.all(promises);
    }

    private _renderOutput(voice: Voice) {
        const voiceNotes = this._frameworkMap.state[voice.id];
        if (!voiceNotes) return;

        const [outputTrack] = getTracksOfType(voice, "output");

        const decorationGroups = getChildren(voice).filter(
            (trackGroup) => getIndex(trackGroup) !== 0
        );
        const decorationOutput = decorationGroups
            .map((trackGroup) => this._decorationsMap.get(trackGroup))
            .filter((value): value is Map<NoteBuilder, Decoration> => {
                return value !== undefined;
            });

        const getFirstValidDecoration = (note: NoteBuilder) => {
            for (const decorations of decorationOutput) {
                const decoration = decorations.get(note);

                if (!decoration || decoration.pitches === undefined) {
                    continue;
                }

                return {
                    ...DECORATION_DEFAULTS,
                    ...decoration,
                } as Required<Decoration>;
            }
        };

        const noteItems = voiceNotes.flatMap((noteBuilder) => {
            if (
                noteBuilder.state.pitch === undefined ||
                noteBuilder.state.isRest === undefined ||
                noteBuilder.state.isRest
            ) {
                return [];
            }

            const decoration = getFirstValidDecoration(noteBuilder);

            const { noteDuration, decoDuration } = (() => {
                const totalDuration =
                    noteBuilder.state.end - noteBuilder.state.start;

                if (decoration && decoration.pitches.length > 0) {
                    const splitPercentage =
                        1 / (Math.abs(decoration.fraction) + 1);

                    const smaller = totalDuration * splitPercentage;
                    const greater = totalDuration * (1 - splitPercentage);

                    const isFractionPositive = decoration.fraction >= 0;

                    const noteDuration = isFractionPositive ? smaller : greater;
                    const decoDuration = isFractionPositive ? greater : smaller;

                    return { noteDuration, decoDuration };
                } else {
                    return { noteDuration: totalDuration, decoDuration: 0 };
                }
            })();

            const notes = [
                { pitch: noteBuilder.state.pitch, duration: noteDuration },
                ...(decoration && decoDuration > MIN_DURATION
                    ? decoration.pitches.map((pitch) => ({
                          pitch: pitch,
                          duration: decoDuration / decoration.pitches.length,
                      }))
                    : []),
            ];

            let nextStart = noteBuilder.state.start;

            return notes.map((note) => {
                const end = nextStart + note.duration;

                const noteItem = new Item("NoteItem", {
                    parent: outputTrack,
                    start: nextStart,
                    end: end,
                    content: note.pitch,
                });

                nextStart = end;

                return noteItem;
            });
        });

        outputTrack.state = {
            children: noteItems,
        };
    }
}

type StateChange<TState extends object> = {
    obj: Stateful<TState>;
    oldState: TState | undefined;
    newState: TState | undefined;
};

type ItemChange = StateChange<ItemState<any>>;

type NoteBuilderState = {
    start: number;
    end: number;
    degree?: number;
    pitch?: number;
    isRest?: boolean;
};

class NoteBuilder extends Stateful<NoteBuilderState> {}

class FrameworkMap extends Stateful<{
    [key: string]: readonly NoteBuilder[];
}> {}

type Decoration = {
    pitches?: number[];
    fraction?: number;
    skip?: boolean;
};

const DECORATION_DEFAULTS = {
    fraction: 1,
    skip: false,
};

function isPointWithinInterval(point: number, interval: Interval): boolean {
    return point >= interval.start && point < interval.end;
}

function getNotesStartingWithinInterval(
    notes: readonly NoteBuilder[],
    interval: Interval
) {
    const firstIndex = notes.findIndex((note) =>
        isPointWithinInterval(note.state.start, interval)
    );
    const lastIndex = notes.findLastIndex((note) =>
        isPointWithinInterval(note.state.start, interval)
    );
    return notes.slice(firstIndex, lastIndex + 1);
}

function getPitchFromChordStatusAndDegree(
    chordStatus: ItemTypes["ChordItem"]["chordStatus"],
    degree: number | undefined
): number | undefined {
    if (!(chordStatus instanceof Chord)) return;

    if (degree !== undefined) {
        return chordStatus.degreeToMidi(degree);
    }
}

function roundToNearestMultiple(value: number, factor: number) {
    return Math.pow(factor, Math.round(Math.log(value) / Math.log(factor)));
}

function isIntegerArray(value: any): boolean {
    if (!Array.isArray(value)) return false;
    if (value.some((item) => !Number.isInteger(item))) return false;
    return true;
}
