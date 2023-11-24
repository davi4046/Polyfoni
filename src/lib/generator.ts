import chroma from "chroma-js";

import { invoke } from "@tauri-apps/api";

import {
    intersectIntervals,
    mergeIntervals,
    subtractIntervals,
} from "./interval";
import { ItemData, ItemModel, NoteModel, TimelineModel } from "./models";

import type { Interval } from "./interval";

const pitchnames = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
];

function quantizeDuration(duration: number) {
    return Math.pow(2, Math.round(Math.log2(duration)));
}

export class Chord {
    private pitchClassSet: number[];

    degreeToPitch(degree: number) {
        let octave = Math.floor(degree / this.pitchClassSet.length) + 4;
        let index = degree % this.pitchClassSet.length;
        while (index < 0) index += this.pitchClassSet.length;
        return this.pitchClassSet[index] + 12 * octave;
    }

    getName() {
        let root = this.pitchClassSet[0] % 12;
        let rootName = pitchnames[(root + 3) % 12];

        let binary = Array(12).fill("0");

        this.pitchClassSet.forEach((pitchClass) => {
            let index = pitchClass - root;

            while (index >= 12) index -= 12;
            while (index < 0) index += 12;

            binary[11 - index] = "1";
        });

        let binaryString = binary.join("");

        let decimal = parseInt(binaryString, 2);

        return rootName + "-" + decimal;
    }

    getColor() {
        const hue = (360 / 12) * this.pitchClassSet[0];
        return chroma.hcl(hue, 100, 80).css();
    }

    public static createFromString(string: string): Chord {
        let parts = string.split("-", 2);

        let root = pitchnames.indexOf(parts[0]);

        if (root == -1) {
            throw new Error("Invalid chord root");
        }

        let decimal = Number(parts[1]);

        if (isNaN(decimal)) {
            throw new Error("Invalid chord decimal");
        }

        let binary = decimal.toString(2);

        while (binary.length < 12) binary = "0" + binary;

        let pitchClassSet = new Set(
            [...Array(12).keys()]
                .filter((x) => binary[11 - x] === "1")
                .map((x) => x + root - 3)
        );

        return new Chord(pitchClassSet);
    }

    public static createFromPitches(pitches: number[]): Chord {
        return new Chord(new Set(pitches.sort()));
    }

    constructor(pitchClassSet: Set<number>) {
        this.pitchClassSet = Array.from(pitchClassSet);
    }
}

class NoteBuilder {
    noteStart: number | undefined = undefined;
    noteEnd: number | undefined = undefined;
    notePitch: number | undefined = undefined;
    noteChord: Chord | undefined = undefined;
    noteIsRest: boolean | undefined = undefined;

    tryBuild() {
        if (
            this.noteStart != undefined &&
            this.noteEnd != undefined &&
            this.notePitch != undefined &&
            this.noteChord != undefined &&
            this.noteIsRest != undefined
        ) {
            let pitch = this.noteChord.degreeToPitch(this.notePitch);

            return new NoteModel(
                this.noteStart,
                this.noteEnd,
                pitch,
                this.noteIsRest
            );
        }
        return null;
    }
}

export class Generator {
    constructor(private _timeline: TimelineModel) {}

    async updateUncoveredIntervals() {
        for (let voice of this._timeline.children) {
            let allIntervals: Interval[] = [];

            voice.children.forEach((track) => {
                track.children.forEach((item) => {
                    allIntervals.push([item.start, item.end]);
                });
            });

            allIntervals.sort((a, b) => {
                return a[0] - b[0];
            });

            allIntervals = mergeIntervals(allIntervals);

            voice.children.forEach((track) => {
                let trackIntervals = track.children.map((item) => {
                    return [item.start, item.end] as Interval;
                });

                trackIntervals.sort((a, b) => {
                    return a[0] - b[0];
                });

                track.uncoveredIntervals = subtractIntervals(
                    allIntervals,
                    trackIntervals
                );
            });
        }
    }

    async updateHarmonicSum(generations: NoteModel[][]) {
        this._timeline.harmonicSumTrack.children.forEach((child) => {
            child.parent = null;
        });

        let intervals = this._timeline.children.flatMap((voice, index) => {
            const harmonyTrack = voice.children[3];

            let intervals = harmonyTrack.children
                .map((item) => {
                    if (item.error === null) {
                        return [item.start, item.end] as Interval;
                    }
                })
                .filter((value): value is Interval => {
                    return value !== undefined;
                });

            let noteIntervals = generations[index].map((note) => {
                return [note.start, note.end] as Interval;
            });

            return subtractIntervals(
                intervals,
                subtractIntervals(intervals, noteIntervals)
            );
        });

        intervals = intersectIntervals(intervals);

        let notes = generations.flat();

        notes.sort((a, b) => {
            return a.start - b.start;
        });

        intervals.forEach((interval) => {
            const startNoteIndex = notes.findIndex((note) => {
                return note.start >= interval[0] && note.start < interval[1];
            });
            const endNoteIndex = notes.findLastIndex((note) => {
                return note.start >= interval[0] && note.start < interval[1];
            });

            let pitches = notes
                .slice(startNoteIndex, endNoteIndex + 1)
                .filter((note) => {
                    return !note.isRest;
                })
                .map((note) => {
                    return note.pitch;
                });

            if (pitches.length === 0) return;

            let chord = Chord.createFromPitches(pitches);

            new ItemModel(
                new ItemData(
                    interval[0],
                    interval[1],
                    chord.getName(),
                    this._timeline.harmonicSumTrack
                ),
                this._timeline.controller
            );
        });

        this._timeline.refresh();
    }

    async regenerate() {
        this.updateUncoveredIntervals();

        let promises: Promise<NoteModel[]>[] = [];

        for (let voice of this._timeline.children) {
            const promise: Promise<NoteModel[]> = new Promise(
                async (resolve, _) => {
                    let durationsMap = new Map<ItemModel, number[]>();

                    const durationsTrack = voice.children[1];

                    for (let item of durationsTrack.children) {
                        item.error = undefined;
                        let length = item.end - item.start;
                        let sum = 0;

                        let durations: number[] = [];

                        while (sum < length) {
                            let index = durations.length;

                            let response = (await invoke("evaluate", {
                                tasks: [`${item.content}, {"x": ${index}}`],
                            })) as Array<String>;

                            let num = Number(response[0].trim());

                            if (isNaN(num)) {
                                durationsMap.set(item, []);
                                item.error = `Failed to evaluate at index ${index}: ${response[0].trim()}`;
                                break;
                            }

                            num = quantizeDuration(Math.abs(num));

                            durations.push(num);
                            sum += num;
                        }

                        durationsMap.set(item, durations);
                        if (item.error == undefined) item.error = null;
                    }

                    let noteBuilders: NoteBuilder[] = [];

                    durationsMap.forEach((value, item) => {
                        if (typeof value === "string") {
                            return;
                        }

                        let offset = 0;

                        value.forEach((duration) => {
                            if (duration <= 0) {
                                return;
                            }

                            let noteBuilder = new NoteBuilder();

                            let start = item.start + offset;
                            let end = start + duration;

                            noteBuilder.noteStart = start;
                            noteBuilder.noteEnd = end;

                            noteBuilders.push(noteBuilder);

                            offset += duration;
                        });
                    });

                    {
                        let itemCounter = new Map<ItemModel, number>();

                        const track = voice.children[0];

                        for (let item of track.children) {
                            item.error = undefined;
                        }

                        for (let note of noteBuilders) {
                            let item = track.getItemAtBeat(note.noteStart!);

                            if (!item || item.error) {
                                continue;
                            }

                            let counter = itemCounter.get(item);
                            let index = counter != undefined ? counter + 1 : 0;
                            itemCounter.set(item, index);

                            let response = (await invoke("evaluate", {
                                tasks: [`${item.content}, {"x": ${index}}`],
                            })) as Array<String>;

                            let pitch = Number(response[0].trim());

                            if (isNaN(pitch)) {
                                item.error = `Failed to evaluate at index ${index}: ${response[0].trim()}`;
                                continue;
                            }

                            note.notePitch = Math.round(pitch);
                            item.error = null;
                        }
                    }

                    {
                        let itemCounter = new Map<ItemModel, number>();

                        const track = voice.children[2];

                        for (let item of track.children) {
                            item.error = undefined;
                        }

                        for (let note of noteBuilders) {
                            let item = track.getItemAtBeat(note.noteStart!);

                            if (!item || item.error) {
                                continue;
                            }

                            let counter = itemCounter.get(item);
                            let index = counter != undefined ? counter + 1 : 0;
                            itemCounter.set(item, index);

                            let response = (await invoke("evaluate", {
                                tasks: [`${item.content}, {"x": ${index}}`],
                            })) as Array<String>;

                            let s = response[0].trim();

                            let isRest =
                                s == "True"
                                    ? true
                                    : s == "False"
                                    ? false
                                    : undefined;

                            if (isRest == undefined) {
                                item.error = `Failed to evaluate at index ${index}: ${response[0].trim()}`;
                                continue;
                            }

                            note.noteIsRest = isRest;
                            item.error = null;
                        }
                    }

                    {
                        let itemCounter = new Map<ItemModel, number>();

                        const track = voice.children[3];

                        for (let item of track.children) {
                            item.error = undefined;
                        }

                        for (let note of noteBuilders) {
                            let item = track.getItemAtBeat(note.noteStart!);

                            if (!item || item.error) {
                                continue;
                            }

                            let counter = itemCounter.get(item);
                            let index = counter != undefined ? counter + 1 : 0;
                            itemCounter.set(item, index);

                            let chord: Chord;

                            try {
                                chord = Chord.createFromString(item.content);
                            } catch (error) {
                                item.error = error as string;
                                continue;
                            }

                            note.noteChord = chord;
                            item.error = null;
                        }
                    }

                    let generation: NoteModel[] = [];

                    noteBuilders.forEach((noteBuilder) => {
                        let note = noteBuilder.tryBuild();

                        if (!note) {
                            return;
                        }
                        generation.push(note);
                    });

                    voice.controller.timeline.refresh();
                    resolve(generation);
                }
            );
            voice.generation = promise;
            promises.push(promise);
        }

        await Promise.all(promises).then((notes) => {
            this.updateHarmonicSum(notes);
        });
    }
}
