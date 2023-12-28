import { addChildren } from "../../../../shared/architecture/state/state_utils";
import Item from "../../models/item/Item";
import { createItemState } from "../../models/item/ItemState";
import clearTrackInterval from "../../utils/clear_track_interval/clearTrackInterval";

import type TimelineContext from "../TimelineContext";

function insertEmptyItems(context: TimelineContext) {
    context.highlightManager.highlights.forEach((highlight) => {
        clearTrackInterval(highlight.track, highlight.start, highlight.end);
        addChildren(
            highlight.track,
            new Item(() =>
                createItemState({
                    parent: highlight.track,
                    start: highlight.start,
                    end: highlight.end,
                    content: "empty",
                })
            )
        );
    });
    context.highlightManager.highlights = [];
}

export default insertEmptyItems;
