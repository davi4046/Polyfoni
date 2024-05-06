import Track from "../track/Track";
import TrackGroup from "../track_group/TrackGroup";
import Voice from "../voice/Voice";
import VoiceGroup from "../voice_group/VoiceGroup";
import Stateful from "../../../architecture/Stateful";
import {
    addChildren,
    type ParentState,
} from "../../../architecture/state-hierarchy-utils";

export interface TimelineState extends ParentState<VoiceGroup> {
    length: number;
    aliases: Record<string, string>;
}

export type ValueAlias = { name: string; value: string };

export default class Timeline extends Stateful<TimelineState> {
    readonly tempoTrack;
    readonly scaleTrack;
    readonly totalTrack;

    constructor() {
        super({
            length: 64,
            aliases: {},
            children: [],
        });

        const voiceGroups = Array.from({ length: 3 }, () => {
            return new VoiceGroup({ parent: this, children: [] });
        });

        super.state = {
            children: voiceGroups,
        };

        let voice;
        let trackGroup;
        let track;

        voice = new Voice({
            label: "",
            instrument: 0,
            parent: voiceGroups[0],
            children: [],
        });
        addChildren(voice.state.parent, voice);

        trackGroup = new TrackGroup({
            parent: voice,
            children: [],
        });
        addChildren(trackGroup.state.parent, trackGroup);

        track = new Track("StringItem", {
            parent: trackGroup,
            children: [],
        });
        addChildren(track.state.parent, track);
        this.tempoTrack = track;

        track = new Track("ChordItem", {
            parent: trackGroup,
            children: [],
        });
        // addChildren(track.state.parent, track);
        this.scaleTrack = track;

        voice = new Voice({
            label: "",
            instrument: 0,
            parent: voiceGroups[2],
            children: [],
        });
        addChildren(voice.state.parent, voice);

        trackGroup = new TrackGroup({
            parent: voice,
            children: [],
        });
        addChildren(trackGroup.state.parent, trackGroup);

        track = new Track("ChordItem", {
            parent: trackGroup,
            children: [],
        });
        addChildren(track.state.parent, track);
        this.totalTrack = track;
    }

    set state(newState: Partial<TimelineState>) {
        super.state = newState;

        if (newState.children) {
            console.warn(
                "Children of Timeline state are not supposed to be updated but have been"
            );
        }
    }

    get state(): Readonly<TimelineState> {
        return super.state;
    }
}
