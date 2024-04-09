import Stateful from "../../../architecture/Stateful";
import TimelinePlayer from "../../features/playback/TimelinePlayer";
import TimelineHistory from "../../features/undo-redo/TimelineHistory";
import type Highlight from "../../models/highlight/Highlight";
import type Item from "../../models/item/Item";
import type Timeline from "../../models/timeline/Timeline";

interface TimelineContextState {
    highlights: Highlight<any>[];
    selectedItems: Item<any>[];
    ghostPairs: [Item<any>, Item<any>][];
    clipboard: Item<any>[];

    collapsed: any[];

    visualStartOverrideMap: Map<Item<any>, number>;
    visualEndOverrideMap: Map<Item<any>, number>;
}

export default class TimelineContext extends Stateful<TimelineContextState> {
    constructor(readonly timeline: Timeline) {
        super({
            highlights: [],
            selectedItems: [],
            ghostPairs: [],
            clipboard: [],
            collapsed: [],

            visualStartOverrideMap: new Map(),
            visualEndOverrideMap: new Map(),
        });

        this.player = new TimelinePlayer(timeline);
        this.history = new TimelineHistory(timeline);
    }

    player: TimelinePlayer;
    history: TimelineHistory;
}
