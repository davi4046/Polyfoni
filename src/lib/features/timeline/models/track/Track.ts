import Model from "../../../../shared/architecture/model/Model";
import {
    addChildren,
    getChildren,
    removeChildren,
} from "../../../../shared/architecture/state/state_utils";
import clearInterval from "../../../../shared/utils/interval/clear_interval/clearInterval";
import Item from "../item/Item";

import type { ItemTypes } from "../_shared/item_types/ItemTypes";
import type { TrackState } from "./TrackState";

class Track<T extends keyof ItemTypes> extends Model<Required<TrackState<T>>> {
    constructor(
        readonly itemType: T,
        state: Required<TrackState<T>>
    ) {
        super(state);
    }

    cropItemsByInterval(
        start: number,
        end: number,
        itemsToIgnore: Item<T>[] = []
    ) {
        const intervals = getChildren(this).map((item) => {
            return {
                start: item.state.start,
                end: item.state.end,
                item: item,
            };
        });

        clearInterval(intervals, { start, end });

        const alreadyUpdated: Item<T>[] = [];
        const newItems: Item<T>[] = [];

        for (const interval of intervals) {
            if (itemsToIgnore.includes(interval.item)) continue;

            if (alreadyUpdated.includes(interval.item)) {
                // Item has appeared as interval data before, meaning its interval has been split.
                // We therefore make a new item for the split part.
                const newItem = new Item(
                    interval.item.itemType,
                    interval.item.state
                );
                newItem.state = {
                    start: interval.start,
                    end: interval.end,
                };
                newItems.push(newItem);
            } else {
                interval.item.state = {
                    start: interval.start,
                    end: interval.end,
                };
                alreadyUpdated.push(interval.item);
            }
        }

        for (const item of getChildren(this)) {
            if (alreadyUpdated.includes(item) || itemsToIgnore.includes(item)) {
                continue;
            }
            // The item's interval has been removed. We therefore remove the item.
            removeChildren(this, item);
        }

        addChildren(this, ...newItems);
    }
}

export default Track;
