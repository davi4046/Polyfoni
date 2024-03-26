import { invoke } from "@tauri-apps/api";

import Stateful from "../../architecture/Stateful";
import {
    getChildren,
    getIndex,
} from "../../architecture/state-hierarchy-utils";
import type Item from "../timeline/models/Item";
import type Timeline from "../timeline/models/Timeline";
import type Voice from "../timeline/models/Voice";
import { midiPlayer } from "../timeline/utils/midiPlayer";
import { trackTypeToIndex } from "../timeline/utils/track-config";
import type Interval from "../../utils/interval/Interval";
import mapRange from "../../utils/math_utils/mapRange";

type Beat = number;
type Tempo = number;

interface TimelinePlayerState {
    motion: PlaybackMotion;
    playingNotes: Item<"NoteItem">[];
    isPlaying: boolean;
}

export default class TimelinePlayer extends Stateful<TimelinePlayerState> {
    constructor(timeline: Timeline) {
        super({
            motion: new PlaybackMotion(0, 0, 0, 0),
            playingNotes: [],
            isPlaying: false,
        });
        this._timeline = timeline;
    }

    private _timeline: Timeline;

    private _nextMotionTimeout: NodeJS.Timeout | undefined;
    private _voiceTimeouts = new Map<Voice, NodeJS.Timeout[]>();

    async startPlayback() {
        if (this.state.isPlaying) return;

        const tempoChanges = new Map<Beat, Tempo>();
        tempoChanges.set(0, 60);

        const tempoItems = getChildren(this._timeline.tempoTrack).slice();
        tempoItems.sort((a, b) => a.state.start - b.state.start);

        const promises: Promise<void>[] = [];

        tempoItems.forEach((item) => {
            const promise = invoke("evaluate", {
                task: `${item.state.content} ||| {}`,
            }).then((result) => {
                const parsedResult = Number(result);

                if (isNaN(parsedResult)) {
                    console.warn("tempo item result error");
                    return;
                }
                if (parsedResult < 15) {
                    console.warn("tempo item result too small");
                    return;
                }
                if (parsedResult > 360) {
                    console.warn("tempo item result too big");
                    return;
                }

                tempoChanges.set(item.state.start, parsedResult);
                tempoChanges.set(item.state.end, 60);
            });
            promises.push(promise);
        });
        await Promise.all(promises);

        const motions: PlaybackMotion[] = [];
        const tempoChangesArray = Array.from(tempoChanges);

        const currTime = new Date().getTime();
        const currBeat = this.state.motion.getBeatAtTime(currTime);

        const lastTempoChange = tempoChangesArray.findLast(
            (element) => element[0] < currBeat
        );

        if (lastTempoChange) {
            lastTempoChange[0] = Math.max(lastTempoChange[0], currBeat);
            tempoChangesArray.splice(
                0,
                tempoChangesArray.indexOf(lastTempoChange)
            );
        }

        let time = currTime;

        for (let i = 0; i < tempoChangesArray.length; i++) {
            const currItem = tempoChangesArray[i];
            const nextItem = tempoChangesArray[i + 1];

            const startBeat = currItem[0];
            const endBeat = nextItem ? nextItem[0] : 64;

            const duration = ((endBeat - startBeat) / currItem[1]) * 60000;

            const startTime = time;
            const endTime = startTime + duration;

            motions.push(
                new PlaybackMotion(startTime, endTime, startBeat, endBeat)
            );

            time = endTime;
        }

        let index = 0;

        const nextMotionLoop = () => {
            const motion = motions[index];

            if (!motion) {
                this.state = {
                    isPlaying: false,
                };
                return;
            }

            this.state = {
                motion: motion,
            };

            index++;

            this._nextMotionTimeout = setTimeout(
                nextMotionLoop,
                motion.endTime - motion.startTime
            );
        };

        nextMotionLoop();

        const voices = getChildren(getChildren(this._timeline)[1]);

        voices.forEach((voice) =>
            this._schedulePlayback(
                voice,
                currBeat,
                64,
                Array.from(tempoChanges)
            )
        );

        this.state = {
            isPlaying: true,
        };
    }

    pausePlayback() {
        if (!this.state.isPlaying) return;

        clearTimeout(this._nextMotionTimeout);
        this._nextMotionTimeout = undefined;

        this._voiceTimeouts.forEach((timeouts, voice) => {
            timeouts.forEach(clearTimeout);
            midiPlayer.allNotesOff(getIndex(voice));
        });

        this._voiceTimeouts.clear();

        const currTime = new Date().getTime();
        const currBeat = this.state.motion.getBeatAtTime(currTime);

        this.state = {
            motion: new PlaybackMotion(currTime, currTime, currBeat, currBeat),
            playingNotes: [],
            isPlaying: false,
        };
    }

    resetPlayback() {
        this._voiceTimeouts.forEach((timeouts, voice) => {
            timeouts.forEach(clearTimeout);
            midiPlayer.allNotesOff(getIndex(voice));
        });

        this._voiceTimeouts.clear();

        this.state = {
            motion: new PlaybackMotion(0, 0, 0, 0),
            playingNotes: [],
            isPlaying: false,
        };
    }

    setPlaybackPosition(beat: number) {
        const currTime = new Date().getTime();

        this.state = {
            motion: new PlaybackMotion(currTime, currTime, beat, beat),
        };

        if (this.state.isPlaying) {
            this.pausePlayback();
            this.startPlayback();
        }
    }

    private _schedulePlayback(
        voice: Voice,
        startBeat: number,
        endBeat: number,
        tempoChanges: [number, number][]
    ) {
        const outputTrack = getChildren(voice)[trackTypeToIndex("output")];
        const timeouts: NodeJS.Timeout[] = [];

        const startTime = calculateTimeAtBeat(tempoChanges, startBeat);

        getChildren(outputTrack).forEach((note: Item<"NoteItem">) => {
            if (note.state.start < startBeat || note.state.start >= endBeat) {
                return;
            }

            const noteStartTime = calculateTimeAtBeat(
                tempoChanges,
                note.state.start
            );
            const noteEndTime = calculateTimeAtBeat(
                tempoChanges,
                note.state.end
            );

            const startTimeout = setTimeout(() => {
                midiPlayer.noteOn(getIndex(voice), note.state.content, 100);
                this.state = {
                    playingNotes: this.state.playingNotes.concat(note),
                };
            }, noteStartTime - startTime);

            const endTimeout = setTimeout(() => {
                midiPlayer.noteOff(getIndex(voice), note.state.content);
                this.state = {
                    playingNotes: this.state.playingNotes.filter(
                        (value) => value !== note
                    ),
                };
            }, noteEndTime - startTime);

            timeouts.push(startTimeout, endTimeout);
        });

        this._voiceTimeouts.set(voice, timeouts);
    }
}

export class PlaybackMotion {
    constructor(
        public startTime: number,
        public endTime: number,
        public startBeat: number,
        public endBeat: number
    ) {}

    getBeatAtTime(time: number): number {
        const clampedTime = Math.min(
            Math.max(time, this.startTime),
            this.endTime
        );
        return mapRange(
            clampedTime,
            this.startTime,
            this.endTime,
            this.startBeat,
            this.endBeat
        );
    }

    getTimeAtBeat(beat: number): number {
        const clampedBeat = Math.min(
            Math.max(beat, this.startBeat),
            this.endBeat
        );
        return mapRange(
            clampedBeat,
            this.startBeat,
            this.endBeat,
            this.startTime,
            this.endTime
        );
    }
}

function calculateTimeAtBeat(
    tempoChanges: [number, number][],
    beat: number
): number {
    let end = tempoChanges.findIndex((tempoChange) => tempoChange[0] >= beat);
    if (end === -1) end = tempoChanges.length;

    let time = 0;

    for (let i = 0; i < end; i++) {
        const currTempoChange = tempoChanges[i];
        const nextTempoChange = tempoChanges[i + 1];

        const startBeat = currTempoChange[0];
        const endBeat = nextTempoChange
            ? Math.min(nextTempoChange[0], beat)
            : beat;

        const duration = ((endBeat - startBeat) / currTempoChange[1]) * 60000;
        time += duration;
    }

    return time;
}
