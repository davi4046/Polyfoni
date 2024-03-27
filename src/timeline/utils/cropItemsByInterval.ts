import Item from "../models/Item";
import type Interval from "../../../utils/interval/Interval";
import clearInterval from "../../lib/utils/interval/clear_interval/clearInterval";

import type { ItemTypes } from "./ItemTypes";

export default function cropItemsByInterval<T extends keyof ItemTypes>(
    items: Item<T>[],
    interval: Interval
): Item<T>[] {
    const intervals = items.map((item) => {
        return {
            start: item.state.start,
            end: item.state.end,
            item: item,
        };
    });

    clearInterval(intervals, interval);

    const alreadyUpdated: Item<T>[] = [];
    const newItems: Item<T>[] = [];

    for (const interval of intervals) {
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
    return [...alreadyUpdated, ...newItems];
}
