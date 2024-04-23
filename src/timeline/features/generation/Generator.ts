import { invoke } from "@tauri-apps/api";

import { sum } from "lodash";

import StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import Stateful from "../../../architecture/Stateful";
import {
    getChildren,
    getGrandparent,
    getIndex,
    getParent,
    getPosition,
    isPositionOnPath,
} from "../../../architecture/state-hierarchy-utils";
import compareArrays from "../../../utils/compareArrays";
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

                    const [removedItems, addedItems] = compareArrays<Item<any>>(
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
        if (change.oldState) {
            await this._clearItemStateEffect(change.oldState);
        }
        if (change.newState) {
            change.obj.state = {
                error: await this._applyItemStateEffect(change.newState),
            };
        }
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
                        const result = await this._evaluateWithAliases(
                            itemState.content,
                            { x: i }
                        );
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
                        isNoteStartWithinInterval(note, item.state)
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
                        const result = await this._evaluateWithAliases(
                            itemState.content,
                            { x: i }
                        );
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
                    const result = await this._evaluateWithAliases(
                        itemState.content,
                        { x: index }
                    );

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
                        new NoteBuilder({ start: beat, end: beat + duration })
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
                const indeces = ownedNotes
                    .slice(0, -1)
                    .map((note) => voiceNotes.indexOf(note));

                const promises = [];

                for (const index of indeces) {
                    const prevNote = voiceNotes[index];
                    const nextNote = voiceNotes[index + 1];

                    if (!prevNote.state.pitch || !nextNote.state.pitch) return;

                    const promise = this._evaluateWithAliases(
                        itemState.content,
                        {
                            prev_pitch: prevNote.state.pitch,
                            next_pitch: nextNote.state.pitch,
                            scale: [0, 2, 4, 5, 7, 9, 11],
                        }
                    );
                    promises.push(promise);
                }

                const results = await Promise.all(promises);
                const parsedResults: (number[] | null)[] = [];

                for (const result of results) {
                    try {
                        const parsedResult = JSON.parse(result);
                        if (
                            parsedResult !== null &&
                            !Number.isInteger(parsedResult) &&
                            !isIntegerArray(parsedResult)
                        ) {
                            throw new Error();
                        }
                        parsedResults.push(
                            parsedResult ? [parsedResult].flat() : parsedResult
                        );
                    } catch {
                        return "Failed to evaluate to pitches";
                    }
                }

                const decorations = this._getDecorations(
                    getParent(itemState.parent)
                );

                for (let i = 0; i < indeces.length; i++) {
                    const pitches = parsedResults[i];

                    if (pitches === null) continue;

                    const prevNote = voiceNotes[indeces[i]];

                    const fraction = 1;

                    const subdivisions = fraction * pitches.length + 1;
                    const totalDuration =
                        prevNote.state.end - prevNote.state.start;
                    const beatsPerSubdivision = totalDuration / subdivisions;

                    if (beatsPerSubdivision < MIN_DURATION) continue;

                    const duration = beatsPerSubdivision * fraction;

                    decorations.set(prevNote, {
                        notes: pitches.map((pitch) => {
                            return { pitch, duration };
                        }),
                        skip: false,
                    });
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

    private async _evaluateWithAliases(
        code: string,
        args: Record<string, any>
    ): Promise<string> {
        const combined_args: any = {};

        for (const key in args) combined_args[key] = args[key];

        this._timeline.state.aliases.forEach(
            ({ name, value }) => (combined_args[name] = value)
        );

        return await invoke("evaluate", {
            task: `eval ||| ${code} ||| ${JSON.stringify(combined_args)}`,
        });
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
            return getChildren(track).filter((item) =>
                notes.find((note) =>
                    isNoteStartWithinInterval(note, item.state)
                )
            );
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

class NoteBuilder extends Stateful<{
    start: number;
    end: number;
    degree?: number;
    pitch?: number;
    isRest?: boolean;
}> {}

class FrameworkMap extends Stateful<{
    [key: string]: readonly NoteBuilder[];
}> {}

type Decoration = {
    notes: { pitch: number; duration: number }[];
    skip: boolean;
};

function isNoteStartWithinInterval(
    note: NoteBuilder,
    interval: Interval
): boolean {
    return (
        note.state.start >= interval.start && note.state.start < interval.end
    );
}

function getNotesStartingWithinInterval(
    notes: readonly NoteBuilder[],
    interval: Interval
) {
    const firstIndex = notes.findIndex((note) =>
        isNoteStartWithinInterval(note, interval)
    );
    const lastIndex = notes.findLastIndex((note) =>
        isNoteStartWithinInterval(note, interval)
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
