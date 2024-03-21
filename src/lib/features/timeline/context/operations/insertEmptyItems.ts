import type TimelineContext from "../TimelineContext";
import Item from "../../models/Item";
import {
    itemInitialContentFunctions,
    type ItemTypes,
} from "../../utils/ItemTypes";
import {
    addChildren,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";

export default function insertEmptyItems(context: TimelineContext) {
    context.state.highlights.forEach((highlight) => {
        const track = getParent(highlight);

        if (!track.state.allowUserEdit) return;

        track.cropItemsByInterval(highlight.state.start, highlight.state.end);

        addChildren(
            track,
            new Item(track.itemType, {
                parent: track,
                start: highlight.state.start,
                end: highlight.state.end,
                content:
                    itemInitialContentFunctions[
                        track.itemType as keyof ItemTypes
                    ](),
            })
        );
    });
    context.state = {
        highlights: [],
    };
}
