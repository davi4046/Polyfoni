import type Highlight from "../models/Highlight";
import type Item from "../models/Item";
import type Timeline from "../models/Timeline";
import TimelinePlayer from "../../playback/TimelinePlayer";
import Stateful from "../../../architecture/Stateful";

interface TimelineContextState {
    editItem?: Item<any>;
    highlights: Highlight[];
    ghostPairs: [Item<any>, Item<any>][];
    selectedItems: Item<any>[];
}

export default class TimelineContext extends Stateful<TimelineContextState> {
    constructor(readonly timeline: Timeline) {
        super({
            highlights: [],
            ghostPairs: [],
            selectedItems: [],
        });

        this.player = new TimelinePlayer(timeline);
    }

    player: TimelinePlayer;
}
