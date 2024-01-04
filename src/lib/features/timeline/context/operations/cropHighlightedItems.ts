import clearTrackInterval from "../../_shared/clear_track_interval/clearTrackInterval";

import type TimelineContext from "../TimelineContext";

function cropHighlightedItems(context: TimelineContext) {
    context.highlightManager.highlights.forEach((highlight) => {
        clearTrackInterval(highlight.track, highlight.start, highlight.end);
    });
    context.highlightManager.highlights = [];
}

export default cropHighlightedItems;
