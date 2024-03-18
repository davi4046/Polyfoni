import Model from "../../../architecture/Model";
import {
    addChildren,
    type ParentState,
} from "../../../architecture/state-hierarchy-utils";

import Section from "./Section";
import Track from "./Track";
import Voice from "./Voice";

export interface TimelineState extends ParentState<Section> {}

export default class Timeline extends Model<TimelineState> {
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
        track = new Track("ChordItem", {
            label: "Scale",
            parent: voice,
            children: [],
            allowUserEdit: true,
        });

        addChildren(voice, track);
        addChildren(sections[0], voice);

        this.scaleTrack = track;

        voice = new Voice({ parent: sections[2], children: [] });
        track = new Track("ChordItem", {
            label: "Total Harmony",
            parent: voice,
            children: [],
            allowUserEdit: false,
        });

        addChildren(voice, track);
        addChildren(sections[2], voice);

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
