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
import mapRange from "../../utils/math_utils/mapRange";

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
    private _bpm = 60;

    startPlayback() {
        if (this.state.isPlaying) return;

        const currTime = new Date().getTime();

        const startBeat = this.state.motion.getBeatAtTime(currTime);
        const endBeat = 64;

        const duration = ((endBeat - startBeat) / this._bpm) * 60000;

        const startTime = currTime;
        const endTime = startTime + duration;

        const voices = getChildren(getChildren(this._timeline)[1]);

        voices.forEach((voice) => {
            this._schedulePlayback(voice, startBeat, endBeat);
        });

        this.state = {
            motion: new PlaybackMotion(startTime, endTime, startBeat, endBeat),
            isPlaying: true,
        };
    }

    pausePlayback() {
        if (!this.state.isPlaying) return;

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

    private _voiceTimeouts = new Map<Voice, NodeJS.Timeout[]>();

    private _schedulePlayback(
        voice: Voice,
        startBeat: number,
        endBeat: number
    ) {
        const outputTrack = getChildren(voice)[trackTypeToIndex("output")];
        const timeouts: NodeJS.Timeout[] = [];

        getChildren(outputTrack).forEach((note: Item<"NoteItem">) => {
            if (note.state.start < startBeat || note.state.start >= endBeat) {
                return;
            }

            const relativeStart = note.state.start - startBeat;
            const relativeEnd = note.state.end - startBeat;

            const relativeStartMS = (relativeStart / this._bpm) * 60000;
            const relativeEndMS = (relativeEnd / this._bpm) * 60000;

            const startTimeout = setTimeout(() => {
                midiPlayer.noteOn(getIndex(voice), note.state.content, 100);
                this.state = {
                    playingNotes: this.state.playingNotes.concat(note),
                };
            }, relativeStartMS);

            const endTimeout = setTimeout(() => {
                midiPlayer.noteOff(getIndex(voice), note.state.content);
                this.state = {
                    playingNotes: this.state.playingNotes.filter(
                        (value) => value !== note
                    ),
                };
            }, relativeEndMS);

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
