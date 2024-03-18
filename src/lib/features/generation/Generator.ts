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
        let noteBuilders = this._voiceMap.get(voice);
        if (!noteBuilders) {
            noteBuilders = [];
            this._voiceMap.set(voice, noteBuilders);
        }
        return noteBuilders;
    }

    private _handleItemAdded(item: Item<any>) {
        const trackType = trackIndexToType(getIndex(getParent(item)));

        switch (trackType) {
            case "pitch":
            case "duration":
            case "rest":
            case "harmony":
        }
    }

    private _handleItemRemoved(item: Item<any>) {
        const voice = getGrandparent(item);

        const trackType = trackIndexToType(getIndex(getParent(item)));

        switch (trackType) {
            case "pitch":
                this._clearPropertyWithinInterval(voice, "degree", item.state);
            case "duration":
                this._removeNotesWithinInterval(voice, item.state);
            case "rest":
                this._clearPropertyWithinInterval(voice, "isRest", item.state);
            case "harmony":
                this._clearPropertyWithinInterval(voice, "pitch", item.state);
        }
    }

    private _clearPropertyWithinInterval(
        voice: Voice,
        property: OptionalKeys<NoteBuilder>,
        interval: Interval
    ) {
        const notes = this._getVoiceNoteBuilders(voice);

        getNotesStartingWithinInterval(notes, interval).forEach((note) => {
            note[property] = undefined;
        });
    }

    private _removeNotesWithinInterval(voice: Voice, interval: Interval) {
        const notes = this._getVoiceNoteBuilders(voice);

        for (const note of getNotesStartingWithinInterval(notes, interval)) {
            const index = notes.indexOf(note);
            notes.splice(index, 1);
        }
    }

    private _adjustNote(note: NoteBuilder) {
        findItemAtNoteStart(note, "duration");
    }
}

class NoteBuilder {
    start: number;
    end: number;

    degree?: number;
    pitch?: number;
    isRest?: boolean;

    voice: Voice;

    constructor(start: number, end: number, voice: Voice) {
        this.start = start;
        this.end = end;
        this.voice = voice;
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

function getTrackOfType<T extends keyof TrackTypes>(
    voice: Voice,
    trackType: T
): Track<TrackTypes[T]> {
    const trackIndex = trackTypeToIndex(trackType);
    return getChildren(voice)[trackIndex] as Track<TrackTypes[T]>;
}

function findItemAtNoteStart<T extends keyof TrackTypes>(
    note: NoteBuilder,
    trackType: T
): Item<TrackTypes[T]> | undefined {
    const track = getTrackOfType(note.voice, trackType);
    return getChildren(track).find((item) =>
        isNoteStartWithinInterval(note, item.state)
    );
}

type TrackTypes = {
    pitch: "StringItem";
    duration: "StringItem";
    rest: "StringItem";
    harmony: "ChordItem";
};

function trackTypeToIndex(trackType: keyof TrackTypes): number {
    switch (trackType) {
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
