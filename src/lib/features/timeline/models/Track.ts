import type { ItemTypes } from "../utils/ItemTypes";
import Model from "../../../architecture/Model";
import * as stateHierarchyUtils from "../../../architecture/state-hierarchy-utils";
import clearInterval from "../../../utils/interval/clear_interval/clearInterval";

import Item from "./Item";
import type Voice from "./Voice";

export interface TrackState<T extends keyof ItemTypes>
    extends stateHierarchyUtils.ChildState<Voice>,
        stateHierarchyUtils.ParentState<Item<T>> {
    label: string;
    allowUserEdit: boolean;
}

export default class Track<T extends keyof ItemTypes> extends Model<
    TrackState<T>
> {
    constructor(
        readonly itemType: T,
        state: TrackState<T>
    ) {
        super(state);
    }

    cropItemsByInterval(
        start: number,
        end: number,
        itemsToIgnore: Item<T>[] = []
    ) {
        const intervals = stateHierarchyUtils.getChildren(this).map((item) => {
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

        for (const item of stateHierarchyUtils.getChildren(this)) {
            if (alreadyUpdated.includes(item) || itemsToIgnore.includes(item)) {
                continue;
            }
            // The item's interval has been removed. We therefore remove the item.
            stateHierarchyUtils.removeChildren(this, item);
        }

        stateHierarchyUtils.addChildren(this, ...newItems);
    }
}
