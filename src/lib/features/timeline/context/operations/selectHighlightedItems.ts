import { getChildren } from "../../../../architecture/state-hierarchy-utils";
import isWithin from "../../../../utils/interval/is_within/isWithin";

import type TimelineContext from "../TimelineContext";

function selectHighlightedItems(context: TimelineContext) {
    const items = context.highlightManager.highlights.flatMap((highlight) => {
        return getChildren(highlight.track).filter((item) => {
            const interval = { start: highlight.start, end: highlight.end };
            return (
                isWithin(item.state.start, interval) &&
                isWithin(item.state.end, interval)
            );
        });
    });
    context.selectionManager.deselectAll();
    items.forEach((item) => context.selectionManager.selectItem(item));
    context.highlightManager.highlights = [];
}

export default selectHighlightedItems;
