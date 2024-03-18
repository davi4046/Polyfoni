import type { OptionalKeys } from "ts-essentials";

import type StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import {
    getChildren,
    getGrandparent,
    getIndex,
    getParent,
} from "../../architecture/state-hierarchy-utils";
import type Item from "../timeline/models/Item";
import type Timeline from "../timeline/models/Timeline";
import Track, { type TrackState } from "../timeline/models/Track";
import type Voice from "../timeline/models/Voice";
import type { ItemTypes } from "../timeline/utils/ItemTypes";
import type Interval from "../../utils/interval/Interval";

export default class Generator {
    private _voiceMap = new Map<Voice, NoteBuilder[]>();

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        watcher.subscribe((obj, oldState) => {
            if (!(obj instanceof Track)) return;

            const { addedItems, removedItems } = compareTrackStates(
                oldState,
                obj.state
            );

            removedItems.forEach((item) => this._handleItemRemoved(item));
            addedItems.forEach((item) => this._handleItemAdded(item));
        });
    }

    private _getVoiceNoteBuilders(voice: Voice): NoteBuilder[] {
        let voiceArray = this._voiceMap.get(voice);

        if (!voiceArray) {
            voiceArray = [];
            this._voiceMap.set(voice, voiceArray);
        }

        return voiceArray;
    }

    private _handleItemAdded(item: Item<any>) {
        switch (getIndex(getParent(item))) {
            // Pitch
            case 1: {
            }
            // Duration
            case 2: {
            }
            // Rest
            case 3: {
            }
            // Harmony
            case 4: {
            }
        }
    }

    private _handleItemRemoved(item: Item<any>) {
        const notes = this._getVoiceNoteBuilders(getGrandparent(item));

        switch (getIndex(getParent(item))) {
            // Pitch
            case 1:
                clearPropertyWithinInterval(notes, "scaleDegree", item.state);
            // Duration
            case 2: {
                // Remove notes starting within the removed item's interval
                for (const note of getNotesStartingWithinInterval(
                    notes,
                    item.state
                )) {
                    const index = notes.indexOf(note);
                    notes.splice(index, 1);
                }

                const durationItems = getChildren(getParent(item));

                function adjustNote(note: NoteBuilder) {
                    const durationItem = durationItems.find((item) =>
                        isNoteStartWithinInterval(note, item.state)
                    )!; // Note must have a duration item, otherwise it would have been removed

                    const index = notes.indexOf(note);

                    if (index > 0) {
                        const prevNote = notes[index - 1];

                        note.start = Math.max(
                            durationItem.state.start,
                            prevNote.end
                        );
                    } else {
                        note.start = durationItem.state.start;
                    }
                }

                const startIndex = notes.findIndex(
                    (note) => note.start > item.state.end
                );

                for (let i = startIndex; i < notes.length; i++) {
                    adjustNote(notes[i]);
                }
            }
            // Rest
            case 3:
                clearPropertyWithinInterval(notes, "isRest", item.state);
            // Harmony
            case 4:
                clearPropertyWithinInterval(notes, "pitch", item.state);
        }
    }
}

class NoteBuilder {
    start: number;
    end: number;

    scaleDegree?: number;
    pitch?: number;
    isRest?: boolean;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
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

function compareTrackStates<T extends keyof ItemTypes>(
    oldState: TrackState<T>,
    newState: TrackState<T>
) {
    const addedItems = newState.children.filter((child) => {
        return !oldState.children.includes(child);
    });
    const removedItems = oldState.children.filter((child) => {
        return !newState.children.includes(child);
    });
    return { addedItems, removedItems };
}

function clearPropertyWithinInterval(
    notes: NoteBuilder[],
    property: OptionalKeys<NoteBuilder>,
    interval: Interval
) {
    getNotesStartingWithinInterval(notes, interval).forEach((note) => {
        note[property] = undefined;
    });
}
