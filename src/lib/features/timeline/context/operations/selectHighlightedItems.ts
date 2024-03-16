import type TimelineContext from "../TimelineContext";
import {
    getChildren,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import isWithin from "../../../../utils/interval/is_within/isWithin";

export default function selectHighlightedItems(context: TimelineContext) {
    const items = context.state.highlights
        .filter((highlight) => getParent(highlight).state.allowUserEdit)
        .flatMap((highlight) => {
            return getChildren(getParent(highlight)).filter((item) => {
                const interval = {
                    start: highlight.state.start,
                    end: highlight.state.end,
                };
                return (
                    isWithin(item.state.start, interval) &&
                    isWithin(item.state.end, interval)
                );
            });
        });
    context.state = {
        highlights: [],
        selectedItems: items,
    };
}
