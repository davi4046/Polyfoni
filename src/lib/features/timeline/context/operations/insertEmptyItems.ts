import { addChildren } from "../../../../shared/architecture/state/state_utils";
import Item from "../../models/item/Item";
import { createItemState } from "../../models/item/ItemState";

import type TimelineContext from "../TimelineContext";

function insertEmptyItems(context: TimelineContext) {
    context.highlightManager.highlights.forEach((highlight) => {
        highlight.track.cropItemsByInterval(highlight.start, highlight.end);
        addChildren(
            highlight.track,
            new Item(
                highlight.track.itemType,
                createItemState({
                    parent: highlight.track,
                    start: highlight.start,
                    end: highlight.end,
                })
            )
        );
    });
    context.highlightManager.highlights = [];
}

export default insertEmptyItems;
