import Stateful from "../../../architecture/Stateful";
import {
    getChildren,
    getIndex,
} from "../../../architecture/state-hierarchy-utils";
import mapRange from "../../../utils/math-utils";
import type Item from "../timeline/models/Item";
import type Timeline from "../timeline/models/Timeline";
import type Voice from "../timeline/models/Voice";
import { midiPlayer } from "../../utils/midiPlayer";
import {
    deriveTempoChangesFromItems,
    type TempoChange,
} from "../../utils/tempo-utils";
import { trackTypeToIndex } from "../../utils/track-config";

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

        const tempoItems = getChildren(this._timeline.tempoTrack).slice();
        const tempoChanges = await deriveTempoChangesFromItems(tempoItems, 60);

        const currTime = new Date().getTime();
        const currBeat = this.state.motion.getBeatAtTime(currTime);

        const lastTempoChange = tempoChanges.findLast(
            (tempoChange) => tempoChange.beat < currBeat
        );

        if (lastTempoChange) {
            lastTempoChange.beat = Math.max(lastTempoChange.beat, currBeat);
            tempoChanges.splice(0, tempoChanges.indexOf(lastTempoChange));
        }

        const motions: PlaybackMotion[] = [];
        let time = currTime;

        for (let i = 0; i < tempoChanges.length; i++) {
            const currItem = tempoChanges[i];
            const nextItem = tempoChanges[i + 1];

            const startBeat = currItem.beat;
            const endBeat = nextItem ? nextItem.beat : 64;

            const duration = ((endBeat - startBeat) / currItem.tempo) * 60000;

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
            this._schedulePlayback(voice, currBeat, 64, tempoChanges)
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
        this.pausePlayback();
        this.state = {
            motion: new PlaybackMotion(0, 0, 0, 0),
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
        tempoChanges: TempoChange[]
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
    tempoChanges: TempoChange[],
    beat: number
): number {
    let end = tempoChanges.findIndex((tempoChange) => tempoChange.beat >= beat);
    if (end === -1) end = tempoChanges.length;

    let time = 0;

    for (let i = 0; i < end; i++) {
        const currTempoChange = tempoChanges[i];
        const nextTempoChange = tempoChanges[i + 1];

        const startBeat = currTempoChange.beat;
        const endBeat = nextTempoChange
            ? Math.min(nextTempoChange.beat, beat)
            : beat;

        const duration =
            ((endBeat - startBeat) / currTempoChange.tempo) * 60000;
        time += duration;
    }

    return time;
}
