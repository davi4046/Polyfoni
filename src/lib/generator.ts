import { invoke } from "@tauri-apps/api";

import { ItemModel, NoteModel, TimelineModel } from "./models";

function quantizeDuration(duration: number) {
    return Math.pow(2, Math.round(Math.log2(duration)));
}

class NoteBuilder {
    noteStart: number | undefined = undefined;
    noteEnd: number | undefined = undefined;
    notePitch: number | undefined = undefined;
    noteChord: string | undefined = undefined;
    noteIsRest: boolean | undefined = undefined;

    tryBuild() {
        if (
            this.noteStart != undefined &&
            this.noteEnd != undefined &&
            this.notePitch != undefined &&
            this.noteIsRest != undefined
        ) {
            return new NoteModel(
                this.noteStart,
                this.noteEnd,
                this.notePitch,
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

                        note.noteChord = item.content;
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

            voice.generation = generation;
        }
    }
}
