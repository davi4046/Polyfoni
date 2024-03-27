import type TimelineContext from "../TimelineContext";
import type Item from "../../models/Item";
import cropItemsByInterval from "../../utils/cropItemsByInterval";
import { getParent } from "../../../lib/architecture/state-hierarchy-utils";

export default function cropHighlightedItems(context: TimelineContext) {
    context.state.highlights.forEach((highlight) => {
        const track = getParent(highlight);

        if (!track.state.allowUserEdit) return;

        track.state = {
            children: cropItemsByInterval(
                track.state.children as Item<any>[],
                highlight.state
            ),
        };
    });
    context.state = {
        highlights: [],
    };
}
