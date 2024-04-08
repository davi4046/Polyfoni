import Section from "../section/Section";
import Track from "../track/Track";
import TrackGroup from "../track_group/TrackGroup";
import Voice from "../voice/Voice";
import Stateful from "../../../architecture/Stateful";
import {
    addChildren,
    type ParentState,
} from "../../../architecture/state-hierarchy-utils";

export interface TimelineState extends ParentState<Section> {}

export default class Timeline extends Stateful<TimelineState> {
    readonly tempoTrack;
    readonly scaleTrack;
    readonly totalTrack;

    constructor() {
        super({
            children: [],
        });

        const sections = Array.from({ length: 3 }, () => {
            return new Section({ parent: this, children: [] });
        });

        super.state = {
            children: sections,
        };

        let voice;
        let trackGroup;
        let track;

        voice = new Voice({ parent: sections[0], children: [] });
        addChildren(voice.state.parent, voice);

        trackGroup = new TrackGroup({ parent: voice, children: [] });
        addChildren(trackGroup.state.parent, trackGroup);

        track = new Track("StringItem", {
            label: "Tempo",
            parent: trackGroup,
            children: [],
            allowUserEdit: true,
        });
        addChildren(track.state.parent, track);
        this.tempoTrack = track;

        track = new Track("ChordItem", {
            label: "Scale",
            parent: trackGroup,
            children: [],
            allowUserEdit: true,
        });
        addChildren(track.state.parent, track);
        this.scaleTrack = track;

        voice = new Voice({ parent: sections[2], children: [] });
        addChildren(voice.state.parent, voice);

        trackGroup = new TrackGroup({ parent: voice, children: [] });
        addChildren(trackGroup.state.parent, trackGroup);

        track = new Track("ChordItem", {
            label: "Total Harmony",
            parent: trackGroup,
            children: [],
            allowUserEdit: false,
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
