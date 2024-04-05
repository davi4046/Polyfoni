import type TimelineContext from "../TimelineContext";
import {
    getChildren,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import Item from "../../../models/item/Item";

export default function copyHighlightedItems(context: TimelineContext) {
    const items = context.state.highlights
        .filter((highlight) => getParent(highlight).state.allowUserEdit)
        .flatMap((highlight) => {
            return getChildren(getParent(highlight))
                .map((item) => {
                    return new Item(item.itemType, {
                        ...item.state,
                        start: Math.max(
                            highlight.state.start,
                            item.state.start
                        ),
                        end: Math.min(highlight.state.end, item.state.end),
                    });
                })
                .filter((item) => item.state.start < item.state.end);
        });

    context.state = {
        clipboard: items,
    };
}
