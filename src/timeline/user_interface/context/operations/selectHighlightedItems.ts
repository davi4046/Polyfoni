import type TimelineContext from "../TimelineContext";
import {
    getChildren,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import type Interval from "../../../../utils/interval/Interval";

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
        selectedItems: context.state.selectedItems
            .concat(items)
            .filter((item, index, array) => array.indexOf(item) === index),
    };
}

function isWithin(value: number, interval: Interval): Boolean {
    return value >= interval.start && value <= interval.end;
}
