import Model from "../../lib/architecture/Model";
import {
    addChildren,
    type ParentState,
} from "../../lib/architecture/state-hierarchy-utils";

import Section from "./Section";
import Track from "./Track";
import Voice from "./Voice";

export interface TimelineState extends ParentState<Section> {}

export default class Timeline extends Model<TimelineState> {
    readonly tempoTrack;
    readonly scaleTrack;
    readonly totalTrack;

    constructor(id?: string) {
        super(
            {
                children: [],
            },
            id
        );

        const sections = Array.from({ length: 3 }, () => {
            return new Section({ parent: this, children: [] });
        });

        super.state = {
            children: sections,
        };

        let voice;
        let track;

        voice = new Voice({ parent: sections[0], children: [] });
        addChildren(voice.state.parent, voice);

        track = new Track("StringItem", {
            label: "Tempo",
            parent: voice,
            children: [],
            allowUserEdit: true,
        });
        addChildren(track.state.parent, track);
        this.tempoTrack = track;

        track = new Track("ChordItem", {
            label: "Scale",
            parent: voice,
            children: [],
            allowUserEdit: true,
        });
        addChildren(track.state.parent, track);
        this.scaleTrack = track;

        voice = new Voice({ parent: sections[2], children: [] });
        addChildren(voice.state.parent, voice);

        track = new Track("ChordItem", {
            label: "Total Harmony",
            parent: voice,
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
