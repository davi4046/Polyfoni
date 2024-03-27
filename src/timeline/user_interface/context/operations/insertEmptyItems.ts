import type TimelineContext from "../TimelineContext";
import Item from "../../../models/item/Item";
import {
    itemInitialContentFunctions,
    type ItemTypes,
} from "../../../models/item/ItemTypes";
import cropItemsByInterval from "../../../utils/cropItemsByInterval";
import {
    addChildren,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";

export default function insertEmptyItems(context: TimelineContext) {
    context.state.highlights.forEach((highlight) => {
        const track = getParent(highlight);

        if (!track.state.allowUserEdit) return;

        track.state = {
            children: cropItemsByInterval(
                track.state.children as Item<any>[],
                highlight.state
            ),
        };

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
