import type TimelineContext from "../TimelineContext";
import Item from "../../models/Item";
import { initialContent, type ItemTypes } from "../../utils/ItemTypes";
import { addChildren } from "../../../../architecture/state-hierarchy-utils";

function insertEmptyItems(context: TimelineContext) {
    context.highlightManager.highlights.forEach((highlight) => {
        highlight.track.cropItemsByInterval(highlight.start, highlight.end);
        addChildren(
            highlight.track,
            new Item(highlight.track.itemType, {
                parent: highlight.track,
                start: highlight.start,
                end: highlight.end,
                content: initialContent[highlight.track.itemType as keyof ItemTypes](),
            })
        );
    });
    context.highlightManager.highlights = [];
}

export default insertEmptyItems;
