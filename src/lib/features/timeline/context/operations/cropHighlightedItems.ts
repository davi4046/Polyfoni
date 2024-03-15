import type TimelineContext from "../TimelineContext";

function cropHighlightedItems(context: TimelineContext) {
    context.highlightManager.highlights.forEach((highlight) => {
        if (!highlight.track.state.allowUserEdit) return;
        highlight.track.cropItemsByInterval(highlight.start, highlight.end);
    });
    context.highlightManager.highlights = [];
}

export default cropHighlightedItems;
