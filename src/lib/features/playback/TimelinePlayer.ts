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

interface TimelinePlayerState {
    playbackPosition: number;
    isPlaying: boolean;
}

export default class TimelinePlayer extends Stateful<TimelinePlayerState> {
    constructor(timeline: Timeline) {
        super({ playbackPosition: 0, isPlaying: false });
        this._timeline = timeline;
    }

    private _timeline: Timeline;
    private _bpm = 60;
    private _interval: NodeJS.Timeout | undefined;

    startPlayback() {
        if (this.state.isPlaying) return;

        const voices = getChildren(getChildren(this._timeline)[1]);

        voices.forEach((voice) => {
            this._schedulePlayback(voice);
        });

        const intervalDuration = 10;

        this._interval = setInterval(() => {
            this.state = {
                playbackPosition:
                    this.state.playbackPosition +
                    (this._bpm / 60000) * intervalDuration,
            };
        }, intervalDuration);

        this.state = {
            isPlaying: true,
        };
    }

    pausePlayback() {
        clearInterval(this._interval);

        this._voiceTimeouts.forEach((timeouts, voice) => {
            timeouts.forEach(clearTimeout);
            midiPlayer.allNotesOff(getIndex(voice));
        });

        this._voiceTimeouts.clear();

        this.state = {
            isPlaying: false,
        };
    }

    private _voiceTimeouts = new Map<Voice, NodeJS.Timeout[]>();

    private _schedulePlayback(voice: Voice) {
        const outputTrack = getChildren(voice)[trackTypeToIndex("output")];

        const timeouts: NodeJS.Timeout[] = [];

        getChildren(outputTrack).forEach((note: Item<"NoteItem">) => {
            if (note.state.start < this.state.playbackPosition) return;

            const relativeStart =
                note.state.start - this.state.playbackPosition;
            const relativeEnd = note.state.end - this.state.playbackPosition;

            const relativeStartMS = (relativeStart / this._bpm) * 60000;
            const relativeEndMS = (relativeEnd / this._bpm) * 60000;

            const startTimeout = setTimeout(() => {
                midiPlayer.noteOn(getIndex(voice), note.state.content, 100);
            }, relativeStartMS);

            const endTimeout = setTimeout(() => {
                midiPlayer.noteOff(getIndex(voice), note.state.content);
            }, relativeEndMS);

            timeouts.push(startTimeout, endTimeout);
        });

        this._voiceTimeouts.set(voice, timeouts);
    }
}
