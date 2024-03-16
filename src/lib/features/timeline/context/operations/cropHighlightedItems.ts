import type TimelineContext from "../TimelineContext";
import { getParent } from "../../../../architecture/state-hierarchy-utils";

export default function cropHighlightedItems(context: TimelineContext) {
    context.state.highlights.forEach((highlight) => {
        const track = getParent(highlight);

        if (!track.state.allowUserEdit) return;

        track.cropItemsByInterval(highlight.state.start, highlight.state.end);
    });
    context.state = {
        highlights: [],
    };
}
