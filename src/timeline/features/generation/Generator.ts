import { invoke } from "@tauri-apps/api";

import StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import type Stateful from "../../../architecture/Stateful";
import {
    getChildren,
    getGrandparent,
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

export default class Generator {
    private _itemChanges: ItemChange[] = [];
    private _isHandlingChanges = false;

    private _voiceNotesMap = new Map<Voice, NoteBuilder[]>();

    private _getVoiceNotes(voice: Voice): NoteBuilder[] {
        let notes = this._voiceNotesMap.get(voice);
        if (!notes) {
            notes = [];
            this._voiceNotesMap.set(voice, notes);
        }
        return notes;
    }

    private _decorationsMap = new Map<TrackGroup, SimpleNoteBuilder[][]>();

    private _getDecoration(trackGroup: TrackGroup): SimpleNoteBuilder[][] {
        let generation = this._decorationsMap.get(trackGroup);
        if (!generation) {
            const voiceNotes = this._getVoiceNotes(getParent(trackGroup));
            generation = new Array(voiceNotes.length - 1).fill([]); // One element per space between two notes
            this._decorationsMap.set(trackGroup, generation);
        }
        return generation;
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

                    const { removedItems, addedItems } = compareArrays<
                        Item<any>
                    >(oldState.children, newState.children);

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
                        for (const voice of this._voiceNotesMap.keys()) {
                            this._renderOutput(voice);
                        }
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
        const voiceNotes = this._getVoiceNotes(voice);
        const ownedNotes = getNotesStartingWithinInterval(
            voiceNotes,
            itemState
        );

        if (ownedNotes.length === 0) return;

        switch (trackType) {
            case "frameworkPitch": {
                ownedNotes.forEach((note) => {
                    note.degree = undefined;
                    note.pitch = undefined;
                });
                break;
            }
            case "frameworkRest": {
                ownedNotes.forEach((note) => {
                    note.isRest = undefined;
                });
                break;
            }
            case "frameworkHarmony": {
                ownedNotes.forEach((note) => {
                    note.pitch = undefined;
                });
                break;
            }
            case "frameworkDuration": {
                ownedNotes.forEach((note) => {
                    voiceNotes.splice(voiceNotes.indexOf(note), 1);
                });

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
                const decorations = this._getDecoration(
                    getParent(itemState.parent)
                );
                const ownedDecorations = decorations.slice(
                    voiceNotes.indexOf(ownedNotes[0]),
                    voiceNotes.indexOf(ownedNotes[ownedNotes.length - 1])
                );
                ownedDecorations.forEach((array) => (array.length = 0));
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
        const voiceNotes = this._getVoiceNotes(voice);
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
                    ownedNotes[i].degree = values[i];
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
                    note.pitch = getPitchFromChordStatusAndDegree(
                        harmonyItem.state.content.chordStatus,
                        note.degree
                    );
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
                    if (result !== "True" && result !== "False") {
                        return "Failed to evaluate to a boolean";
                    }
                }

                for (let i = 0; i < ownedNotes.length; i++) {
                    ownedNotes[i].isRest = results[i] === "True";
                }

                break;
            }
            case "frameworkHarmony": {
                const ownedNotes = getNotesStartingWithinInterval(
                    voiceNotes,
                    itemState
                );
                ownedNotes.forEach((note) => {
                    note.pitch = getPitchFromChordStatusAndDegree(
                        itemState.content.chordStatus,
                        note.degree
                    );
                });
                break;
            }
            case "frameworkDuration": {
                ownedNotes.forEach((note) => {
                    voiceNotes.splice(voiceNotes.indexOf(note), 1);
                });

                const firstOverlappingNote = voiceNotes.find((note) => {
                    return (
                        note.start < itemState.start &&
                        note.end > itemState.start
                    );
                });

                let beat = firstOverlappingNote
                    ? Math.max(itemState.start, firstOverlappingNote.end)
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

                    if (duration < 0.015625) {
                        if (skippedIndeces === 3) {
                            return "Failed to return a large enough value too many times";
                        } else {
                            skippedIndeces++;
                            continue;
                        }
                    }
                    skippedIndeces = 0;

                    newNotes.push(new NoteBuilder(beat, beat + duration));
                    beat += duration;
                }

                voiceNotes.push(...newNotes);
                voiceNotes.sort((a, b) => a.start - b.start);

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
                // recalculate pitches for owned decorations
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
        args: Record<string, number>
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
        const voiceNotes = this._getVoiceNotes(voice);
        const [outputTrack] = getTracksOfType(voice, "output");

        const notes = voiceNotes
            .map((noteBuilder) => {
                if (
                    noteBuilder.pitch !== undefined &&
                    noteBuilder.isRest !== undefined &&
                    !noteBuilder.isRest
                ) {
                    return new Item("NoteItem", {
                        parent: outputTrack,
                        start: noteBuilder.start,
                        end: noteBuilder.end,
                        content: noteBuilder.pitch,
                    });
                }
            })
            .filter((value): value is Item<"NoteItem"> => {
                return value !== undefined;
            });

        outputTrack.state = {
            children: notes,
        };
    }
}

type StateChange<TState extends object> = {
    obj: Stateful<TState>;
    oldState: TState | undefined;
    newState: TState | undefined;
};

type ItemChange = StateChange<ItemState<any>>;

class NoteBuilder {
    constructor(
        public start: number,
        public end: number
    ) {}

    degree?: number;
    pitch?: number;
    isRest?: boolean;
}

class SimpleNoteBuilder {
    duration?: number;
    pitch?: number;
    isSkip?: boolean;
}

function isNoteStartWithinInterval(
    note: NoteBuilder,
    interval: Interval
): boolean {
    return note.start >= interval.start && note.start < interval.end;
}

function getNotesStartingWithinInterval(
    notes: NoteBuilder[],
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
