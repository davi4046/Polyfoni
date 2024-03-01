import type TimelineContext from "../TimelineContext";
import Item from "../../models/Item";
import { addChildren } from "../../../../shared/architecture/state/state_utils";

function insertEmptyItems(context: TimelineContext) {
    context.highlightManager.highlights.forEach((highlight) => {
        highlight.track.cropItemsByInterval(highlight.start, highlight.end);
        addChildren(
            highlight.track,
            new Item(highlight.track.itemType, {
                parent: highlight.track,
                start: highlight.start,
                end: highlight.end,
                content: null,
            })
        );
    });
    context.highlightManager.highlights = [];
}

export default insertEmptyItems;
