import { invoke } from "@tauri-apps/api";

import type StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import {
    getChildren,
    getIndex,
    getParent,
} from "../../architecture/state-hierarchy-utils";
import type Item from "../timeline/models/Item";
import type Timeline from "../timeline/models/Timeline";
import Track, { type TrackState } from "../timeline/models/Track";
import type Voice from "../timeline/models/Voice";
import type { ItemTypes } from "../timeline/utils/ItemTypes";
import type Interval from "../../utils/interval/Interval";
import { Chord } from "../timeline/utils/chord/Chord";

export default class Generator {
    private _voiceMap = new Map<Voice, NoteBuilder[]>();

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        watcher.subscribe((obj, oldState) => {
            if (obj instanceof Track) {
                this._handleTrackChanges(obj, oldState);
            }
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

    private _handleTrackChanges(track: Track<any>, oldState: TrackState<any>) {
        const removedItems = oldState.children.filter((child) => {
            return !getChildren(track).includes(child);
        });

        const addedItems = getChildren(track).filter((child) => {
            return !oldState.children.includes(child);
        });

        let voice = this._voiceMap.get(getParent(track));

        if (!voice) {
            voice = [];
            this._voiceMap.set(getParent(track), voice);
        }

        switch (getIndex(track)) {
            // Pitch
            case 1:
                this._handlePitchTrackChanges(voice, removedItems, addedItems);
            // Duration
            case 2:
                this._handleDurationTrackChanges(track, oldState);
            // Rest
            case 3:
                this._handleRestTrackChanges(voice, removedItems, addedItems);
            // Harmony
            case 4:
                this._handleHarmonyTrackChanges(
                    voice,
                    removedItems,
                    addedItems
                );
        }
    }

    private _handlePitchTrackChanges(
        voice: NoteBuilder[],
        removedItems: Item<"StringItem">[],
        addedItems: Item<"StringItem">[]
    ) {
        for (const item of removedItems) {
            getNotesStartingWithinInterval(voice, item.state).forEach(
                (note) => (note.pitch = undefined)
            );
        }

        let promises = [];

        for (const item of addedItems) {
            let index = 0;
            for (const note of getNotesStartingWithinInterval(
                voice,
                item.state
            )) {
                const promise = (async () => {
                    const response = await invoke("evaluate", {
                        task: `${item.state.content} ||| {"x": ${index}}`,
                    });

                    const parsedValue = Number(response);

                    if (isNaN(parsedValue)) {
                        throw Error("TODO: Handle pitch error gracefully");
                    } else {
                        note.scaleDegree = Math.round(parsedValue);
                    }
                })();

                promises.push(promise);
            }
        }

        // await Promise.all(promises)
    }

    private _handleDurationTrackChanges(
        track: Track<"StringItem">,
        oldState: TrackState<"StringItem">
    ) {
        const { addedItems, removedItems } = compareTrackStates(
            oldState,
            track.state
        );

        const voice = this._getVoiceNoteBuilders(getParent(track));

        for (const item of removedItems) {
            for (const note of getNotesStartingWithinInterval(
                voice,
                item.state
            )) {
                const noteIndex = voice.indexOf(note);
                voice.splice(noteIndex, 1);
            }
        }

        addedItems.sort((a, b) => a.state.start - b.state.start);

        for (const item of addedItems) {
        }
    }

    private _handleRestTrackChanges(
        voice: NoteBuilder[],
        removedItems: Item<"StringItem">[],
        addedItems: Item<"StringItem">[]
    ) {
        for (const item of removedItems) {
            getNotesStartingWithinInterval(voice, item.state).forEach(
                (note) => (note.isRest = undefined)
            );
        }

        let promises = [];

        for (const item of addedItems) {
            let index = 0;

            for (const note of getNotesStartingWithinInterval(
                voice,
                item.state
            )) {
                const promise = (async () => {
                    const response = await invoke("evaluate", {
                        task: `${item.state.content} ||| {"x": ${index}}`,
                    });

                    if (response === "True" || response === "False") {
                        note.isRest = response === "True";
                    } else {
                        throw Error("TODO: Handle isRest error gracefully");
                    }
                })();

                promises.push(promise);
            }
        }
    }

    private _handleHarmonyTrackChanges(
        voice: NoteBuilder[],
        removedItems: Item<"ChordItem">[],
        addedItems: Item<"ChordItem">[]
    ) {
        for (const item of removedItems) {
            getNotesStartingWithinInterval(voice, item.state).forEach(
                (note) => (note.pitch = undefined)
            );
        }

        for (const item of addedItems) {
            const chord = item.state.content.chordStatus;

            if (!(chord instanceof Chord)) return;

            for (const note of getNotesStartingWithinInterval(
                voice,
                item.state
            )) {
                if (!note.scaleDegree) continue;
                note.pitch = chord.convertDegreeToMidiValue(note.scaleDegree);
            }
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
    voice: NoteBuilder[],
    interval: Interval
) {
    const firstIndex = voice.findIndex((note) =>
        isNoteStartWithinInterval(note, interval)
    );
    const lastIndex = voice.findLastIndex((note) =>
        isNoteStartWithinInterval(note, interval)
    );
    return voice.slice(firstIndex, lastIndex + 1);
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
