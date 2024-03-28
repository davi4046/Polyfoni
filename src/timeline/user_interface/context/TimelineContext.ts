import Stateful from "../../../architecture/Stateful";
import TimelinePlayer from "../../features/playback/TimelinePlayer";
import type Highlight from "../../models/highlight/Highlight";
import type Item from "../../models/item/Item";
import type Timeline from "../../models/timeline/Timeline";

interface TimelineContextState {
    editItem?: Item<any>;
    highlights: Highlight<any>[];
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
