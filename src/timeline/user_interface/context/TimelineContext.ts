import Stateful from "../../../architecture/Stateful";
import TimelinePlayer from "../../features/playback/TimelinePlayer";
import type Highlight from "../../models/highlight/Highlight";
import type { ItemState } from "../../models/item/Item";
import type Item from "../../models/item/Item";
import type { ItemTypes } from "../../models/item/ItemTypes";
import type Timeline from "../../models/timeline/Timeline";

interface TimelineContextState {
    highlights: Highlight<any>[];
    ghostPairs: [Item<any>, Item<any>][];
    selectedItems: Item<any>[];
    grips: Map<Item<any>, ItemKeyValuePair<any, "start" | "end">>;

    editItem?: Item<any>;
}

type ItemKeyValuePair<
    T extends keyof ItemTypes,
    U extends keyof ItemState<T>,
> = {
    property: U;
    value: ItemState<T>[U];
};

export default class TimelineContext extends Stateful<TimelineContextState> {
    constructor(readonly timeline: Timeline) {
        super({
            highlights: [],
            ghostPairs: [],
            selectedItems: [],
            grips: new Map(),
        });

        this.player = new TimelinePlayer(timeline);
    }

    player: TimelinePlayer;
}
