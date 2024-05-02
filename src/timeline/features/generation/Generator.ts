import { invoke } from "@tauri-apps/api";

import { isBoolean } from "lodash";

import StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import Stateful, { type UnsubscribeFn } from "../../../architecture/Stateful";
import {
    getChildren,
    getGrandparent,
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

    private _decorationsMap = new Map<Voice, Map<NoteBuilder, Decoration>>();

    private _getDecorations(voice: Voice) {
        let decorations = this._decorationsMap.get(voice);
        if (!decorations) {
            decorations = new Map();
            this._decorationsMap.set(voice, decorations);
        }
        return decorations;
    }

    private _timeline: Timeline;

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        this._timeline = watcher.root;

        const durationTracks = getTracksOfType(
            this._timeline,
            "frameworkDuration"
        );

        this._itemChanges = durationTracks.flatMap((track) =>
            getChildren(track).map((item) => {
                return { obj: item, oldState: undefined, newState: item.state };
            })
        );

        this._tryHandlingChanges();

        watcher.subscribe((obj, oldState, newState) => {
            const position = getPosition(obj);

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
            this._tryHandlingChanges();
        });
    }

    private _tryHandlingChanges() {
        if (this._itemChanges.length === 0 || this._isHandlingChanges) {
            return;
        }

        const noteWatcher = this._watchNoteChanges();

        const handleNextChangeLoop = () => {
            const nextChange = this._itemChanges.shift();

            if (nextChange) {
                this._handleChange(nextChange).then(handleNextChangeLoop);
            } else {
                this._isHandlingChanges = false;

                noteWatcher.updateDecorations().then(() => {
                    //render output
                    const voices = getChildren(getChildren(this._timeline)[1]);
                    for (const voice of voices) {
                        this._renderOutput(voice);
                    }
                });
            }
        };
        this._isHandlingChanges = true;
        handleNextChangeLoop();
    }

    private async _handleChange(change: ItemChange) {
        if (change.oldState) {
            await this._clearItemStateEffect(change.oldState);
        }
        if (change.newState) {
            const error = await this._applyItemStateEffect(change.newState);
            change.obj.state = { error };
        }
    }

    private _watchNoteChanges(): {
        updateDecorations: () => Promise<void>;
    } {
        const subscriptions: UnsubscribeFn[] = [];

        const updatedNotes = new Set<NoteBuilder>();

        Object.values(this._frameworkMap.state).forEach((framework) => {
            for (const note of framework) {
                const unsubscribe = note.subscribe(() => {
                    updatedNotes.add(note);
                    const prevNote = framework[framework.indexOf(note) - 1];
                    if (prevNote) updatedNotes.add(prevNote);
                });
                subscriptions.push(unsubscribe);
            }
        });

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

        const updateDecorations = async () => {
            subscriptions.forEach((unsubscribe) => unsubscribe());

            const decorationMapEntries = this._decorationsMap.entries();
            const owningItems = new Set<Item<any>>();

            for (const [voice, decorations] of decorationMapEntries) {
                const framework = this._frameworkMap.state[voice.id];

                if (!framework) continue;

                const tracks = [
                    getTracksOfType(voice, "decorationPitches")[0],
                    getTracksOfType(voice, "decorationFraction")[0],
                    getTracksOfType(voice, "decorationSkip")[0],
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
                        .flatMap((track) => getChildren(track))
                        .filter((item) =>
                            isPointWithinInterval(note.state.start, item.state)
                        )
                        .forEach((item) => owningItems.add(item));
                }
            }

            const promises = [];

            for (const item of owningItems) {
                promises.push(this._applyItemStateEffect(item.state));
            }

            await Promise.all(promises);
        };

        return { updateDecorations };
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
            const decorations = this._getDecorations(voice);

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
                this._getDecorations(voice); // Create decorations entry for voice if not already created

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
        if (itemState.content === "") return;

        const trackType = getTrackType(itemState.parent);
        const voice = getGrandparent(itemState.parent);

        const voiceNotes = this._getFramework(voice).slice();
        const ownedNotes = getNotesStartingWithinInterval(
            voiceNotes,
            itemState
        );

        const getAdjacentNotePairs = () => {
            const indeces = ownedNotes
                .slice(0, -1)
                .map((note) => voiceNotes.indexOf(note));

            const pairs = indeces
                .map((index) => {
                    const prevNote = voiceNotes[index].build();
                    const nextNote = voiceNotes[index + 1].build();

                    if (
                        !prevNote ||
                        !nextNote ||
                        prevNote.isRest ||
                        nextNote.isRest
                    ) {
                        return;
                    }

                    return [prevNote, nextNote];
                })
                .filter((value): value is [Note, Note] => {
                    return value !== undefined;
                });

            return pairs;
        };

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

                const newNotes: NoteBuilder[] = [];

                // Construct new notes
                {
                    const firstOverlappingNote = voiceNotes.find((note) => {
                        return (
                            note.state.start < itemState.start &&
                            note.state.end > itemState.start
                        );
                    });

                    let beat = firstOverlappingNote
                        ? Math.max(
                              itemState.start,
                              firstOverlappingNote.state.end
                          )
                        : itemState.start;
                    let index = 0;
                    let skippedIndeces = 0;

                    while (beat < itemState.end) {
                        const args = {
                            ...this._timeline.state.aliases,
                            x: index,
                        };
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
                    this._getDecorations(voice); // Create decorations entry for voice if not already created
                }

                // Reapply following duration items
                {
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
                }

                // Reapply items that own one of the new notes
                {
                    const owningItems = new Set<Item<any>>();

                    const tracks = [
                        getTracksOfType(voice, "frameworkPitch")[0],
                        getTracksOfType(voice, "frameworkRest")[0],
                        getTracksOfType(voice, "frameworkHarmony")[0],
                    ];

                    for (const note of newNotes) {
                        tracks.forEach((track) => {
                            const owningItem = getChildren(track).find((item) =>
                                isPointWithinInterval(
                                    note.state.start,
                                    item.state
                                )
                            );
                            if (owningItem) owningItems.add(owningItem);
                        });
                    }

                    const promises = Array.from(owningItems).map(
                        async (item) => {
                            item.state = {
                                error: await this._applyItemStateEffect(
                                    item.state
                                ),
                            };
                        }
                    );
                    await Promise.all(promises);
                }
                break;
            }
            case "decorationPitches": {
                const decorations = this._getDecorations(voice);

                const [harmonyTrack] = getTracksOfType(
                    voice,
                    "decorationHarmony"
                );

                const pairs = getAdjacentNotePairs();
                const promises = [];

                for (let index = 0; index < pairs.length; index++) {
                    const [prevNote, nextNote] = pairs[index];

                    const harmony = getDecorationHarmony(
                        prevNote,
                        harmonyTrack
                    );

                    const args = JSON.stringify({
                        ...this._timeline.state.aliases,
                        prev_degree: harmony.midiToDegree(prevNote.pitch),
                        next_degree: harmony.midiToDegree(nextNote.pitch),
                        x: index,
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

                let results: any[];

                try {
                    results = await Promise.all(promises);
                } catch {
                    return "Failed to evaluate to an integer, a list of integers, or None";
                }

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
                const decorations = this._getDecorations(voice);

                const [harmonyTrack] = getTracksOfType(
                    voice,
                    "decorationHarmony"
                );

                const pairs = getAdjacentNotePairs();
                const promises = [];

                for (let index = 0; index < pairs.length; index++) {
                    const [prevNote, nextNote] = pairs[index];

                    const harmony = getDecorationHarmony(
                        prevNote,
                        harmonyTrack
                    );

                    const args = JSON.stringify({
                        ...this._timeline.state.aliases,
                        prev_degree: harmony.midiToDegree(prevNote.pitch),
                        next_degree: harmony.midiToDegree(nextNote.pitch),
                        x: index,
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

                let results: any[];

                try {
                    results = await Promise.all(promises);
                } catch {
                    return "Failed to evaluate to a number";
                }

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
                const decorations = this._getDecorations(voice);

                const [harmonyTrack] = getTracksOfType(
                    voice,
                    "decorationHarmony"
                );

                const pairs = getAdjacentNotePairs();
                const promises = [];

                for (let index = 0; index < pairs.length; index++) {
                    const [prevNote, nextNote] = pairs[index];

                    const harmony = getDecorationHarmony(
                        prevNote,
                        harmonyTrack
                    );

                    const args = JSON.stringify({
                        ...this._timeline.state.aliases,
                        prev_degree: harmony.midiToDegree(prevNote.pitch),
                        next_degree: harmony.midiToDegree(nextNote.pitch),
                        x: index,
                    });

                    const promise = (async () => {
                        const result: string = await invoke("evaluate", {
                            task: `eval ||| ${itemState.content} ||| ${args}`,
                        });

                        const parsedResult = JSON.parse(result);

                        if (!isBoolean(parsedResult)) {
                            throw new Error("Failed to evaluate skip");
                        }

                        return parsedResult;
                    })();

                    promises.push(promise);
                }

                let results: any[];

                try {
                    results = await Promise.all(promises);
                } catch {
                    return "Failed to evaluate to a boolean";
                }

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

                const pairs = getAdjacentNotePairs();

                const owningItems = new Set<Item<any>>();

                for (let i = 0; i < pairs.length; i++) {
                    const [prevNote] = pairs[i];

                    const pitchesItem = pitchesTrack.state.children.find(
                        (item) =>
                            isPointWithinInterval(prevNote.start, item.state)
                    );

                    if (pitchesItem) owningItems.add(pitchesItem);
                }

                const promises = Array.from(owningItems).map((item) =>
                    this._applyItemStateEffect(item.state).then((error) => {
                        item.state = { error };
                    })
                );
                await Promise.all(promises);
                break;
            }
        }
    }

    private _renderOutput(voice: Voice) {
        const voiceNotes = this._frameworkMap.state[voice.id];
        if (!voiceNotes) return;

        const [outputTrack] = getTracksOfType(voice, "output");

        const decorations = this._getDecorations(voice);

        const noteItems = voiceNotes.flatMap((noteBuilder) => {
            if (
                noteBuilder.state.pitch === undefined ||
                noteBuilder.state.isRest === undefined ||
                noteBuilder.state.isRest
            ) {
                return [];
            }

            const decoration = (() => {
                const decoration = decorations.get(noteBuilder);

                if (!decoration) return;

                const filteredEntries = Object.entries(decoration).filter(
                    ([_, value]) => value !== undefined
                );

                return {
                    ...DECORATION_DEFAULTS,
                    ...Object.fromEntries(filteredEntries),
                } as Decoration;
            })();

            const notes = (() => {
                const totalDuration =
                    noteBuilder.state.end - noteBuilder.state.start;

                if (
                    decoration === undefined ||
                    decoration.pitches === undefined ||
                    decoration.fraction === undefined ||
                    decoration.skip === undefined ||
                    decoration.skip ||
                    decoration.pitches.length === 0
                ) {
                    return [
                        {
                            pitch: noteBuilder.state.pitch,
                            duration: totalDuration,
                        },
                    ];
                } else {
                    const splitPercentage =
                        1 / (Math.abs(decoration.fraction) + 2);

                    const smaller = totalDuration * splitPercentage;
                    const greater = totalDuration * (1 - splitPercentage);

                    const isFractionPositive = decoration.fraction >= 0;

                    const noteDuration = isFractionPositive ? smaller : greater;
                    const decoDuration =
                        (isFractionPositive ? greater : smaller) /
                        decoration.pitches.length;

                    return Math.min(noteDuration, decoDuration) > MIN_DURATION
                        ? [
                              {
                                  pitch: noteBuilder.state.pitch,
                                  duration: noteDuration,
                              },
                              ...decoration.pitches.map((pitch) => {
                                  return {
                                      pitch: pitch,
                                      duration: decoDuration,
                                  };
                              }),
                          ]
                        : [
                              {
                                  pitch: noteBuilder.state.pitch,
                                  duration: totalDuration,
                              },
                          ];
                }
            })();

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

class NoteBuilder extends Stateful<NoteBuilderState> {
    build(): Note | undefined {
        if (
            this.state.degree === undefined ||
            this.state.pitch === undefined ||
            this.state.isRest === undefined
        ) {
            return;
        }
        return this.state as Required<NoteBuilderState>;
    }
}

type Note = Required<NoteBuilderState>;

class FrameworkMap extends Stateful<{
    [key: string]: readonly NoteBuilder[];
}> {}

type Decoration = {
    pitches?: number[];
    fraction?: number;
    skip?: boolean;
};

const DECORATION_DEFAULTS = {
    fraction: 0,
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

function getDecorationHarmony(
    note: Note,
    harmonyTrack: Track<"ChordItem">
): Chord {
    const harmonyItem = getChildren(harmonyTrack).find((item) =>
        isPointWithinInterval(note.start, item.state)
    );

    if (
        !harmonyItem ||
        !(harmonyItem.state.content.chordStatus instanceof Chord)
    ) {
        return Chord.fromDecimal("A", 4095);
    }

    return harmonyItem.state.content.chordStatus;
}
