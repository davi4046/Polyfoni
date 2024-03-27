import type TimelineContext from "../TimelineContext";
import cropItemsByInterval from "../../../utils/cropItemsByInterval";
import {
    addChildren,
    getParent,
    removeChildren,
} from "../../../../architecture/state-hierarchy-utils";
import type Item from "../../../models/item/Item";

export default function placeGhostItems(context: TimelineContext) {
    const selectedItems = Object.assign([], context.state.selectedItems);

    context.state.ghostPairs.forEach((pair) => {
        const oldTrack = getParent(pair[0]);
        const newTrack = getParent(pair[1]);

        newTrack.state = {
            children: cropItemsByInterval(
                newTrack.state.children as Item<any>[],
                pair[1].state
            ),
        };

        removeChildren(oldTrack, pair[0]);
        addChildren(newTrack, pair[1]);

        const index = selectedItems.indexOf(pair[0]);

        if (index >= 0) {
            selectedItems.splice(index, 1);
            selectedItems.push(pair[1]);
        }
    });
    context.state = {
        ghostPairs: [],
        selectedItems: selectedItems,
    };
}
