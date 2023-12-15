import {
    addChildren,
    getChildren,
    removeChildren,
} from "../../../../shared/state/state_utils";
import clearInterval from "../../../../shared/utils/interval/clearInterval";
import Interval from "../../../../shared/utils/interval/Interval";
import Item from "../../models/item/Item";

import type Track from "../../models/track/Track";

function clearTrackInterval(
    track: Track,
    start: number,
    end: number,
    itemsToIgnore: Item[] = []
) {
    const items = getChildren(track);

    const intervals = items.map((item) => {
        return new Interval(item.state.start, item.state.end, item);
    });

    clearInterval(intervals, new Interval(start, end));

    const alreadyUpdated: Item[] = [];
    const newItems: Item[] = [];

    for (const interval of intervals) {
        const item = interval.data!;

        if (itemsToIgnore.includes(item)) continue;

        if (alreadyUpdated.includes(item)) {
            // Item has appeared as interval data before, meaning its interval has been split.
            // We therefore make a new item for the split part.
            const newItem = new Item(() => item.state);
            newItem.state = {
                start: interval.start,
                end: interval.end,
            };
            newItems.push(newItem);
        } else {
            item.state = {
                start: interval.start,
                end: interval.end,
            };
            alreadyUpdated.push(item);
        }
    }

    for (const item of items) {
        if (alreadyUpdated.includes(item) || itemsToIgnore.includes(item)) {
            continue;
        }
        // The item's interval has been removed. We therefore remove the item.
        removeChildren(track, item);
    }

    addChildren(track, ...newItems);
}

export default clearTrackInterval;
