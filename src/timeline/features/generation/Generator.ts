import { invoke } from "@tauri-apps/api";

import { sum } from "lodash";

import StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import Stateful, { type UnsubscribeFn } from "../../../architecture/Stateful";
import {
    getChildren,
    getGrandparent,
    getIndex,
    getLastAncestor,
    getParent,
    getPosition,
    isPositionOnPath,
} from "../../../architecture/state-hierarchy-utils";
import purifyArrays from "../../../utils/purifyArrays";
import { Chord, getPitchesFromRootAndDecimal } from "../../models/item/Chord";
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
        const promises = [];

        for (const [trackGroup, decorations] of decorationMapEntries) {
            const voice = getParent(trackGroup);
            const framework = this._frameworkMap.state[voice.id];

            if (!framework) continue;

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

                try {
                    assertRequired(note.state);
                    assertRequired(nextNote.state);

                    const promise = createDecoration(
                        trackGroup,
                        note.state,
                        nextNote.state
                    ).then((decoration) => {
                        if (decoration) {
                            decorations.set(note, decoration);
                        } else {
                            decorations.delete(note);
                        }
                    });
                    promises.push(promise);
                } catch {
                    decorations.delete(note);
                    continue;
                }
            }
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
                const decorations = this._getDecorations(
                    getParent(itemState.parent)
                );
                const ownedDecorations = ownedNotes
                    .slice(0, -1)
                    .map((note) => decorations.get(note))
                    .filter((value): value is Decoration => {
                        return value !== undefined;
                    });

                ownedDecorations.forEach((decoration) => {
                    decoration.notes.length = 0;
                });
                break;
            }
            case "decorationFraction": {
                // recalculate duration of notes in owned decorations
                break;
            }
            case "decorationSkip": {
                // set owned decorations to skipped some way
                break;
            }
            case "decorationHarmony": {
                // recalculate pitches for owned decorations
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

                    const harmony = (() => {
                        if (
                            harmonyItem &&
                            harmonyItem.state.content.chordStatus instanceof
                                Chord
                        ) {
                            return harmonyItem.state.content
                                .chordStatus as Chord;
                        }

                        const root = "A";
                        const decimal = 4095;
                        const pitches = getPitchesFromRootAndDecimal(
                            root,
                            decimal
                        );

                        return new Chord(root, decimal, pitches);
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

                    const promise = await invoke("evaluate", {
                        task: `eval ||| ${itemState.content} ||| ${args}`,
                    });

                    promises.push(promise);
                }

                const results = (await Promise.all(promises)) as string[];

                const parsedResults: number[][] = results.map((result) => {
                    const parsedResult = JSON.parse(result);

                    if (
                        !Number.isInteger(parsedResult) &&
                        !isIntegerArray(parsedResult) &&
                        parsedResult !== null
                    ) {
                        throw new Error("Failed to evaluate pitches");
                    }

                    return parsedResult !== null
                        ? [parsedResult].flat() // In case pitches evaluate to a single integer
                        : [];
                });

                for (let i = 0; i < parsedResults.length; i++) {
                    const degrees = parsedResults[i];
                    const decoration = decorations.get(ownedNotes[i]);
                    decorations.set(
                        ownedNotes[i],
                        decoration ? { ...decoration, degrees } : { degrees }
                    );
                }
                break;
            }
            case "decorationFraction": {
                // recalculate durations of notes in owned decorations
                break;
            }
            case "decorationSkip": {
                // recalculate skip for owned decorations
                break;
            }
            case "decorationHarmony": {
                // recalculate pitches for owned decorations
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
                if (
                    decoration &&
                    decoration.notes.length > 0 &&
                    !decoration.skip
                ) {
                    return decoration;
                }
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
            const decorationDuration = decoration
                ? sum(decoration.notes.map(({ duration }) => duration))
                : 0;

            const note = {
                pitch: noteBuilder.state.pitch,
                duration:
                    noteBuilder.state.end -
                    noteBuilder.state.start -
                    decorationDuration,
            };

            const notes = decoration ? [note, ...decoration.notes] : [note];

            let start = noteBuilder.state.start;

            return notes.map((note) => {
                const end = start + note.duration;
                const noteItem = new Item("NoteItem", {
                    parent: outputTrack,
                    start: start,
                    end: end,
                    content: note.pitch,
                });
                start = end;
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
    degrees?: number[];
    harmony?: Chord;
    skip?: boolean;
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

function assertRequired<T>(obj: T): asserts obj is Required<T> {
    // Check if all properties are defined
    for (const key in obj) {
        if (obj[key as keyof T] === undefined) {
            throw new Error(`Property '${key}' is not defined.`);
        }
    }
}

async function createDecoration(
    trackGroup: TrackGroup,
    prevNote: Required<NoteBuilderState>,
    nextNote: Required<NoteBuilderState>
): Promise<Decoration | undefined> {
    const [pitchesTrack] = getTracksOfType(trackGroup, "decorationPitches");
    const [fractionTrack] = getTracksOfType(trackGroup, "decorationFraction");
    const [skipTrack] = getTracksOfType(trackGroup, "decorationSkip");
    const [harmonyTrack] = getTracksOfType(
        trackGroup,
        "decorationHarmony"
    ) as Track<"ChordItem">[];

    const isPrevStartWithinItem = (item: Item<any>) => {
        return isPointWithinInterval(prevNote.start, item.state);
    };

    const pitchesItem = getChildren(pitchesTrack).find(isPrevStartWithinItem);
    const fractionItem = getChildren(fractionTrack).find(isPrevStartWithinItem);
    const skipItem = getChildren(skipTrack).find(isPrevStartWithinItem);
    const harmonyItem = getChildren(harmonyTrack).find(isPrevStartWithinItem);

    if (!pitchesItem) return;

    const timeline = getLastAncestor(trackGroup);

    const harmony = (() => {
        if (
            harmonyItem &&
            harmonyItem.state.content.chordStatus instanceof Chord
        ) {
            return harmonyItem.state.content.chordStatus;
        }

        const root = "A";
        const decimal = 4095;
        const pitches = getPitchesFromRootAndDecimal(root, decimal);

        return new Chord(root, decimal, pitches);
    })();

    const prevDegree = harmony.midiToDegree(prevNote.pitch);
    const nextDegree = harmony.midiToDegree(nextNote.pitch);

    const args = {
        ...timeline.state.aliases,
        prev_degree: prevDegree,
        next_degree: nextDegree,
    };

    const jsonArgs = JSON.stringify(args);

    const degrees = await (async () => {
        const result: string = await invoke("evaluate", {
            task: `eval ||| ${pitchesItem.state.content} ||| ${jsonArgs}`,
        });

        const parsedResult = JSON.parse(result);

        if (
            parsedResult !== null &&
            !Number.isInteger(parsedResult) &&
            !isIntegerArray(parsedResult)
        ) {
            throw new Error("Failed to evaluate pitches");
        }

        return parsedResult !== null
            ? ([parsedResult].flat() as number[]) // In case pitches evaluate to a single integer
            : null;
    })();

    if (degrees === null) return;

    const fraction = await (async () => {
        if (!fractionItem) return 1;

        const args = {
            ...timeline.state.aliases,
            prev_degree: prevDegree,
            next_degree: nextDegree,
        };

        const jsonArgs = JSON.stringify(args);

        const result: string = await invoke("evaluate", {
            task: `eval ||| ${fractionItem.state.content} ||| ${jsonArgs}`,
        });

        const parsedResult = JSON.parse(result);

        if (isNaN(parsedResult)) {
            throw new Error("Failed to evaluate fraction");
        }

        return Math.round(parsedResult);
    })();

    const prevNoteDuration = prevNote.end - prevNote.start;
    const subdivisions = fraction * degrees.length + 1;
    const beatsPerSubdivision = prevNoteDuration / subdivisions;

    if (beatsPerSubdivision < MIN_DURATION) return;

    const duration = beatsPerSubdivision * fraction;

    const skip = await (async () => {
        if (!skipItem) return false;

        const args = {
            ...timeline.state.aliases,
            prev_degree: prevDegree,
            next_degree: nextDegree,
        };

        const jsonArgs = JSON.stringify(args);

        const result: string = await invoke("evaluate", {
            task: `eval ||| ${skipItem.state.content} ||| ${jsonArgs}`,
        });

        if (result != "true" && result != "false") {
            throw new Error("Failed to evaluate skip");
        }

        return result == "true";
    })();

    return {
        notes: degrees.map((degree) => {
            const pitch = harmony.degreeToMidi(degree);
            return { pitch, duration };
        }),
        skip: skip,
    };
}
