import type StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import {
    countAncestors,
    getIndex,
    getParent,
} from "../../architecture/state-hierarchy-utils";
import type { ItemState } from "../timeline/models/Item";
import type Timeline from "../timeline/models/Timeline";
import type { TrackState } from "../timeline/models/Track";
import type Voice from "../timeline/models/Voice";
import type Interval from "../../utils/interval/Interval";

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
                    this._itemChanges.push(
                        ...deriveItemChangesFromTrackChange(change)
                    );
                    break;
                }
                // Item
                case 4: {
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
                        //render output
                    }
                };
                this._isHandlingChanges = true;
                handleNextChangeLoop();
            }
        });
    }

    private async _handleChange(change: ItemChange) {
        if (change.oldState) this._clearItemStateEffect(change.oldState);
        if (change.newState) this._applyItemStateEffect(change.newState);
    }

    private _clearItemStateEffect(itemState: ItemState<any>) {
        const trackType = trackIndexToType(getIndex(itemState.parent));

        if (!trackType || trackType === "output") return;

        const voice = getParent(itemState.parent);
        const voiceNotes = this._getVoiceNotes(voice);
        const ownedNotes = getNotesStartingWithinInterval(
            voiceNotes,
            itemState
        );

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
                if (ownedNotes.length === 0) break;

                ownedNotes.forEach((note) => {
                    voiceNotes.splice(voiceNotes.indexOf(note), 1);
                });

                const movedNotes = adjustNotesToPreventOverlaps(
                    voiceNotes,
                    (note) => {
                        //return start of the duration item owning this note
                    }
                );

                //update properties of moved notes
                //if note duration changes, we adjust positions of the following notes

                break;
            }
        }
    }

    private _applyItemStateEffect(itemState: ItemState<any>) {}
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

/**
 * Adjusts the positions of notes to prevent overlaps between adjacent notes.
 *
 * @param notes An array of notes to adjust.
 * @param calcMinStart An optional function that calculates the minimum start time for a note.
 * @returns An array containing the notes that were moved.
 */
function adjustNotesToPreventOverlaps(
    notes: NoteBuilder[],
    calcMinStart?: (note: NoteBuilder) => number
): NoteBuilder[] {
    const modifiedNotes: NoteBuilder[] = [];

    for (let i = 0; i < notes.length; i++) {
        const prevNoteEnd = i > 0 ? notes[i - 1].end : notes[i].start;
        const newStart = calcMinStart
            ? Math.max(prevNoteEnd, calcMinStart(notes[i]))
            : prevNoteEnd;
        const duration = notes[i].end - notes[i].start;

        if (notes[i].start !== newStart) {
            notes[i].start = newStart;
            notes[i].end = newStart + duration;
            modifiedNotes.push(notes[i]);
        }
    }

    return modifiedNotes;
}
