import type TimelineContext from "../TimelineContext";
import {
    addChildren,
    getParent,
    removeChildren,
} from "../../../../architecture/state-hierarchy-utils";

export default function placeGhostItems(context: TimelineContext) {
    const selectedItems = Object.assign([], context.state.selectedItems);

    context.state.ghostPairs.forEach((pair) => {
        const oldTrack = getParent(pair[0]);
        const newTrack = getParent(pair[1]);

        newTrack.cropItemsByInterval(pair[1].state.start, pair[1].state.end);

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
