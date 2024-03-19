import { invoke } from "@tauri-apps/api";

import type { OptionalKeys } from "ts-essentials";

import { range } from "lodash";

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
import { Chord } from "../timeline/utils/chord/Chord";

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
        const voiceNotes = this._getVoiceNoteBuilders(getGrandparent(item));
        const notes = getNotesStartingWithinInterval(voiceNotes, item.state);

        switch (trackType) {
            case "pitch": {
                for (const index of range(notes.length)) {
                    invoke("evaluate", {
                        task: `${item.state.content} ||| {"x": ${index}}`,
                    }).then((value) => {
                        notes[index].degree = processResultAsDegree(value);

                        const harmonyItem = findItemAtNoteStart(
                            notes[index],
                            "harmony"
                        );

                        if (harmonyItem) {
                            setNotePitchFromChordItem(
                                notes[index],
                                harmonyItem
                            );
                        }
                    });
                }
            }
            case "duration": {
                // TODO: Remove existing notes???

                const prevNote = voiceNotes.find(
                    (note) => note.end < item.state.start
                );

                let beat = prevNote
                    ? Math.max(prevNote.end, item.state.start)
                    : item.state.start;

                let index = 0;

                const newNotes: NoteBuilder[] = [];

                (async () => {
                    while (beat < item.state.end) {
                        const result = await invoke("evaluate", {
                            task: `${item.state.content} ||| {"x": ${index}}`,
                        });

                        const duration = processResultAsDuration(result);

                        newNotes.push(
                            new NoteBuilder(
                                beat,
                                beat + duration,
                                getGrandparent(item)
                            )
                        );

                        index++;
                        beat += duration;
                    }
                })().then(() => {
                    voiceNotes.push(...newNotes);
                    voiceNotes.sort((a, b) => a.start - b.start);

                    const lastNote = newNotes[newNotes.length - 1];
                    const nextNoteIndex = voiceNotes.indexOf(lastNote) + 1;

                    if (voiceNotes.length > nextNoteIndex) {
                        const nextNote = voiceNotes[nextNoteIndex];
                        this._adjustNoteStartRecursively(
                            nextNote,
                            lastNote.end
                        );
                    }
                });
            }
            case "rest": {
                for (const index of range(notes.length)) {
                    invoke("evaluate", {
                        task: `${item.state.content} ||| {"x": ${index}}`,
                    }).then((value) => {
                        notes[index].isRest = processResultAsRest(value);
                    });
                }
            }
            case "harmony": {
                notes.forEach((note) => {
                    setNotePitchFromChordItem(note, item);
                });
            }
        }
    }

    private _handleItemRemoved(item: Item<any>) {
        const trackType = trackIndexToType(getIndex(getParent(item)));
        const voiceNotes = this._getVoiceNoteBuilders(getGrandparent(item));
        const notes = getNotesStartingWithinInterval(voiceNotes, item.state);

        switch (trackType) {
            case "pitch":
                notes.forEach((note) => {
                    note.degree = undefined;
                    note.pitch = undefined;
                });
            case "duration": {
                notes.forEach((note) => {
                    voiceNotes.splice(voiceNotes.indexOf(note), 1);
                });

                const lastNote = notes[notes.length - 1];
                const nextNoteIndex = voiceNotes.indexOf(lastNote) + 1;

                if (voiceNotes.length > nextNoteIndex) {
                    const nextNote = voiceNotes[nextNoteIndex];
                    this._adjustNoteStartRecursively(nextNote, lastNote.end);
                }
            }
            case "rest":
                notes.forEach((note) => {
                    note.isRest = undefined;
                });
            case "harmony":
                notes.forEach((note) => {
                    note.pitch = undefined;
                });
        }
    }

    private _adjustNoteStartRecursively(note: NoteBuilder, minStart: number) {
        const pitchItem = findItemAtNoteStart(note, "pitch");
        const durationItem = findItemAtNoteStart(note, "duration");
        const restItem = findItemAtNoteStart(note, "rest");
        const harmonyItem = findItemAtNoteStart(note, "harmony");

        if (!durationItem) return; // If this is true, the note will be removed in a later iteration

        const oldNoteStart = note.start;
        const newNoteStart = Math.max(minStart, durationItem.state.start);

        note.start = newNoteStart;

        if (newNoteStart !== oldNoteStart) {
            const newPitchItem = findItemAtNoteStart(note, "pitch");
            const newDurationItem = findItemAtNoteStart(note, "duration");
            const newRestItem = findItemAtNoteStart(note, "rest");
            const newHarmonyItem = findItemAtNoteStart(note, "harmony");

            const voiceNotes = this._getVoiceNoteBuilders(note.voice);

            if (newPitchItem !== pitchItem) {
                if (newPitchItem) {
                    const notes = getNotesStartingWithinInterval(
                        voiceNotes,
                        newPitchItem.state
                    );
                    const index = notes.indexOf(note);

                    invoke("evaluate", {
                        task: `${newPitchItem.state.content} ||| {"x": ${index}}`,
                    }).then((value) => {
                        note.degree = processResultAsDegree(value);
                        // We're updating the pitch later in this flow
                    });
                } else {
                    note.degree = undefined;
                    note.pitch = undefined;
                }
            }
            if (newDurationItem !== durationItem) {
                if (newDurationItem) {
                    const notes = getNotesStartingWithinInterval(
                        voiceNotes,
                        newDurationItem.state
                    );
                    const index = notes.indexOf(note);

                    invoke("evaluate", {
                        task: `${newDurationItem.state.content} ||| {"x": ${index}}`,
                    }).then((value) => {
                        note.end = note.start + processResultAsDuration(value);
                    });
                } else {
                    voiceNotes.splice(voiceNotes.indexOf(note), 1);
                }
            }
            if (newRestItem !== restItem) {
                if (newRestItem) {
                    const notes = getNotesStartingWithinInterval(
                        voiceNotes,
                        newRestItem.state
                    );
                    const index = notes.indexOf(note);

                    invoke("evaluate", {
                        task: `${newRestItem.state.content} ||| {"x": ${index}}`,
                    }).then((value) => {
                        note.isRest = processResultAsRest(value);
                    });
                } else {
                    note.isRest = undefined;
                }
            }
            if (newHarmonyItem !== harmonyItem || newPitchItem !== pitchItem) {
                if (newHarmonyItem) {
                    setNotePitchFromChordItem(note, newHarmonyItem);
                } else {
                    note.pitch = undefined;
                }
            }

            const nextNoteIndex = voiceNotes.indexOf(note) + 1;

            if (voiceNotes.length > nextNoteIndex) {
                const nextNote = voiceNotes[nextNoteIndex];
                this._adjustNoteStartRecursively(nextNote, note.end);
            }
        }
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

function processResultAsDegree(value: unknown): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
        throw Error("TODO: Handle pitch error gracefully");
    } else {
        return Math.round(parsedValue);
    }
}

function processResultAsDuration(value: unknown): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
        throw Error("TODO: Handle duration error gracefully");
    } else {
        return parsedValue;
    }
}

function processResultAsRest(value: unknown): boolean {
    if (value === "True" || value === "False") {
        return value === "True";
    } else {
        throw Error("TODO: Handle isRest error gracefully");
    }
}

function setNotePitchFromChordItem(note: NoteBuilder, item: Item<"ChordItem">) {
    const chord = item.state.content.chordStatus;

    if (note.degree && chord instanceof Chord) {
        note.pitch = chord.convertDegreeToMidiValue(note.degree);
    } else {
        note.pitch = undefined;
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
