import type TimelineContext from "../TimelineContext";
import cropItemsByInterval from "../../../utils/cropItemsByInterval";
import { getParent } from "../../../../architecture/state-hierarchy-utils";
import type Item from "../../../models/item/Item";

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
