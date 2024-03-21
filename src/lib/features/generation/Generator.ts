import { invoke } from "@tauri-apps/api";

import { range } from "lodash";

import type StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import {
    addChildren,
    countAncestors,
    getChildren,
    getIndex,
    getParent,
    removeChildren,
} from "../../architecture/state-hierarchy-utils";
import type { ItemState } from "../timeline/models/Item";
import Item from "../timeline/models/Item";
import type Timeline from "../timeline/models/Timeline";
import type { TrackState } from "../timeline/models/Track";
import type Track from "../timeline/models/Track";
import type Voice from "../timeline/models/Voice";
import type { ItemTypes } from "../timeline/utils/ItemTypes";
import type Interval from "../../utils/interval/Interval";
import { Chord } from "../timeline/utils/chord/Chord";

export default class Generator {
    private _itemChanges: ItemChange[] = [];
    private _isHandlingChanges = false;

    private _voiceMap = new Map<Voice, NoteBuilder[]>();

    private _getVoiceNotes(voice: Voice): NoteBuilder[] {
        let noteBuilders = this._voiceMap.get(voice);
        if (!noteBuilders) {
            noteBuilders = [];
            this._voiceMap.set(voice, noteBuilders);
        }
        return noteBuilders;
    }

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        watcher.subscribe((obj, oldState) => {
            const objDepth = countAncestors(obj);
            const newState = obj.state as any;
            const change = { oldState, newState };

            switch (objDepth) {
                // Track
                case 3: {
                    const trackType = trackIndexToType(
                        getIndex(obj as Track<any>)
                    );
                    if (trackType === "output") break;

                    this._itemChanges.push(
                        ...deriveItemChangesFromTrackChange(change)
                    );
                    break;
                }
                // Item
                case 4: {
                    const trackType = trackIndexToType(
                        getIndex(getParent(obj as Item<any>))
                    );
                    if (trackType === "output") break;

                    this._itemChanges.push(change);
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
                        // TODO: render output
                        console.log("finsihed generation");
                        console.log(this._voiceMap);
                    }
                };
                this._isHandlingChanges = true;
                handleNextChangeLoop();
            }
        });
    }

    private async _handleChange(change: ItemChange) {
        try {
            if (change.oldState)
                await this._clearItemStateEffect(change.oldState);
            if (change.newState)
                await this._applyItemStateEffect(change.newState);
        } catch (error) {
            console.error(error);
        }
    }

    private async _clearItemStateEffect(itemState: ItemState<any>) {
        const trackType = trackIndexToType(getIndex(itemState.parent));
        const voice = getParent(itemState.parent);
        const voiceNotes = this._getVoiceNotes(voice);
        const ownedNotes = getNotesStartingWithinInterval(
            voiceNotes,
            itemState
        );

        if (ownedNotes.length === 0) return;

        switch (trackType) {
            case "pitch": {
                ownedNotes.forEach((note) => {
                    note.degree = undefined;
                    note.pitch = undefined;
                });
                break;
            }
            case "rest": {
                ownedNotes.forEach((note) => {
                    note.isRest = undefined;
                });
                break;
            }
            case "harmony": {
                ownedNotes.forEach((note) => {
                    note.pitch = undefined;
                });
                break;
            }
            case "duration": {
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
                    await this._applyItemStateEffect(nextDurationItem.state);
                }
                break;
            }
        }
    }

    private async _applyItemStateEffect(itemState: ItemState<any>) {
        const trackType = trackIndexToType(getIndex(itemState.parent));
        const voice = getParent(itemState.parent);
        const voiceNotes = this._getVoiceNotes(voice);
        const ownedNotes = getNotesStartingWithinInterval(
            voiceNotes,
            itemState
        );

        switch (trackType) {
            case "pitch": {
                const promises = [];

                for (const index of range(ownedNotes.length)) {
                    const promise = (async () => {
                        const result = await invoke("evaluate", {
                            task: `${itemState.content} ||| {"x": ${index}}`,
                        });

                        const parsedResult = Number(result);

                        if (isNaN(parsedResult)) {
                            console.warn("pitch item result error");
                            return;
                        }

                        ownedNotes[index].degree = Math.round(parsedResult);
                    })();
                    promises.push(promise);
                }
                await Promise.all(promises);

                // Recalculate pitch based on harmony for ownedNotes
                const voice = getParent(itemState.parent);
                const harmonyTrack =
                    getChildren(voice)[trackTypeToIndex("harmony")];

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
            case "rest": {
                const promises = [];

                for (const index of range(ownedNotes.length)) {
                    const promise = (async () => {
                        const result = await invoke("evaluate", {
                            task: `${itemState.content} ||| {"x": ${index}}`,
                        });

                        const parsedResult = String(result).trim();

                        if (
                            parsedResult === "True" ||
                            parsedResult === "False"
                        ) {
                            ownedNotes[index].isRest = parsedResult === "True";
                        } else {
                            console.warn("rest item result error");
                            return;
                        }
                    })();
                    promises.push(promise);
                }
                await Promise.all(promises);
                break;
            }
            case "harmony": {
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
            case "duration": {
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

                const newNotes: NoteBuilder[] = [];

                while (beat < itemState.end) {
                    const result = await invoke("evaluate", {
                        task: `${itemState.content} ||| {"x": ${index}}`,
                    });

                    const parsedResult = Number(result);

                    if (isNaN(parsedResult)) {
                        console.warn("duration item result error");
                        return;
                    }

                    newNotes.push(new NoteBuilder(beat, beat + parsedResult));

                    index++;
                    beat += parsedResult;
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
                    await this._applyItemStateEffect(nextDurationItem.state);
                }

                await this._remakePropertiesForNotes(voice, newNotes);
                break;
            }
        }
    }

    private async _remakePropertiesForNotes(
        voice: Voice,
        notes: NoteBuilder[]
    ) {
        const pitchTrack = getChildren(voice)[trackTypeToIndex("pitch")];
        const restTrack = getChildren(voice)[trackTypeToIndex("rest")];
        const harmonyTrack = getChildren(voice)[trackTypeToIndex("harmony")];

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
            promises.push(this._applyItemStateEffect(item.state));
        }

        await Promise.all(promises);
    }
}

type StateChange<TState> = {
    oldState: TState;
    newState: TState;
};

type ItemChange = StateChange<ItemState<any> | undefined>;

function deriveItemChangesFromTrackChange(
    change: StateChange<TrackState<any>>
): ItemChange[] {
    const removedItems = change.oldState.children.filter((child) => {
        return !change.newState.children.includes(child);
    });

    const addedItems = change.newState.children.filter((child) => {
        return !change.oldState.children.includes(child);
    });

    const itemChanges: ItemChange[] = [];

    removedItems.forEach((item) => {
        itemChanges.push({ oldState: item.state, newState: undefined });
    });

    addedItems.forEach((item) => {
        itemChanges.push({ oldState: undefined, newState: item.state });
    });

    return itemChanges;
}

class NoteBuilder {
    constructor(
        public start: number,
        public end: number
    ) {}

    degree?: number;
    pitch?: number;
    isRest?: boolean;
}

type TrackTypes = {
    output: "NoteItem";
    pitch: "StringItem";
    duration: "StringItem";
    rest: "StringItem";
    harmony: "ChordItem";
};

function trackTypeToIndex(trackType: keyof TrackTypes): number {
    switch (trackType) {
        case "output":
            return 0;
        case "pitch":
            return 1;
        case "duration":
            return 2;
        case "rest":
            return 3;
        case "harmony":
            return 4;
    }
}

function trackIndexToType(index: number): keyof TrackTypes | undefined {
    switch (index) {
        case 0:
            return "output";
        case 1:
            return "pitch";
        case 2:
            return "duration";
        case 3:
            return "rest";
        case 4:
            return "harmony";
    }
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
        return chordStatus.convertDegreeToMidiValue(degree);
    }
}
