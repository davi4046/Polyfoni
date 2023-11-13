import { invoke } from "@tauri-apps/api";

import { ItemModel, NoteModel, TimelineModel } from "./models";

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

class Chord {
    private pitchClassSet: Array<number>;

    degreeToPitch(degree: number) {
        let octave = Math.floor(degree / this.pitchClassSet.length) + 4;
        let index = degree % this.pitchClassSet.length;
        while (index < 0) index += this.pitchClassSet.length;
        return this.pitchClassSet[index] + 12 * octave;
    }

    constructor(public str: string) {
        let parts = str.split("-", 2);

        let root = pitchnames.indexOf(parts[0]);

        if (root == -1) {
            throw new Error("Invalid chord root");
        }

        let decimal = Number(parts[1]);

        if (isNaN(decimal)) {
            console.log(parts[1]);
            throw new Error("Invalid chord decimal");
        }

        let binary = decimal.toString(2);

        while (binary.length < 12) binary = "0" + binary;

        this.pitchClassSet = [...Array(12).keys()]
            .filter((x) => binary[11 - x] === "1")
            .map((x) => x + root - 3);
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

            if (isNaN(pitch)) {
                console.log("pitch:", this.notePitch);
                console.log("chord:", this.noteChord);
            }

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

    async regenerate() {
        console.log("regenerate called");

        for (let voice of this._timeline.children) {
            voice.generation = new Promise(async (resolve, reject) => {
                let durationsMap = new Map<ItemModel, number[] | string>();

                const durationsTrack = voice.children[1];

                for (let item of durationsTrack.children) {
                    let length = item.end - item.start;
                    let sum = 0;

                    let durations: number[] = [];

                    while (sum < length) {
                        let index = durations.length;

                        let response = (await invoke("evaluate", {
                            tasks: [[item.content, { x: index }]],
                        })) as Array<String>;

                        let num = Number(response[0].trim());

                        if (isNaN(num)) {
                            durationsMap.set(item, response[0].trim());
                            break;
                        }

                        num = quantizeDuration(Math.abs(num));

                        durations.push(num);
                        sum += num;
                    }

                    durationsMap.set(item, durations);
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

                    for (let note of noteBuilders) {
                        let item = track.getItemAtBeat(note.noteStart!);
                        if (item) {
                            let counter = itemCounter.get(item);
                            let index = counter != undefined ? counter + 1 : 0;
                            itemCounter.set(item, index);

                            let response = (await invoke("evaluate", {
                                tasks: [[item.content, { x: index }]],
                            })) as Array<String>;

                            let pitch = Number(response[0].trim());

                            if (isNaN(pitch)) {
                                continue;
                            }

                            note.notePitch = Math.round(pitch);
                        }
                    }
                }

                {
                    let itemCounter = new Map<ItemModel, number>();

                    const track = voice.children[2];

                    for (let note of noteBuilders) {
                        let item = track.getItemAtBeat(note.noteStart!);
                        if (item) {
                            let counter = itemCounter.get(item);
                            let index = counter != undefined ? counter + 1 : 0;
                            itemCounter.set(item, index);

                            let response = (await invoke("evaluate", {
                                tasks: [[item.content, { x: index }]],
                            })) as Array<String>;

                            let s = response[0].trim();

                            let isRest =
                                s == "True"
                                    ? true
                                    : s == "False"
                                    ? false
                                    : undefined;

                            note.noteIsRest = isRest;
                        }
                    }
                }

                {
                    let itemCounter = new Map<ItemModel, number>();

                    const track = voice.children[3];

                    for (let note of noteBuilders) {
                        let item = track.getItemAtBeat(note.noteStart!);
                        if (item) {
                            let counter = itemCounter.get(item);
                            let index = counter != undefined ? counter + 1 : 0;
                            itemCounter.set(item, index);

                            let chord: Chord;

                            try {
                                chord = new Chord(item.content);
                            } catch (error) {
                                continue;
                            }

                            note.noteChord = chord;
                        }
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

                resolve(generation);
            });
        }
    }
}
