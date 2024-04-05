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
    grips: Map<Item<any>, { property: "start" | "end"; value: number }>;
    clipboard: Item<any>[];

    editItem?: Item<any>;
}

export default class TimelineContext extends Stateful<TimelineContextState> {
    constructor(readonly timeline: Timeline) {
        super({
            highlights: [],
            selectedItems: [],
            ghostPairs: [],
            grips: new Map(),
            clipboard: [],
        });

        this.player = new TimelinePlayer(timeline);
        this.history = new TimelineHistory(timeline);
    }

    player: TimelinePlayer;
    history: TimelineHistory;
}
