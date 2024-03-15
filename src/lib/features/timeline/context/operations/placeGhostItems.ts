import type TimelineContext from "../TimelineContext";
import {
    addChildren,
    getParent,
    removeChildren,
} from "../../../../architecture/state-hierarchy-utils";

export default function placeGhostItems(context: TimelineContext) {
    context.state.ghostPairs.forEach((pair) => {
        const oldTrack = getParent(pair[0]);
        const newTrack = getParent(pair[1]);

        pair[0].state = pair[1].state;

        newTrack.cropItemsByInterval(pair[1].state.start, pair[1].state.end);

        removeChildren(oldTrack, pair[0]);
        addChildren(newTrack, pair[0]);
    });
    context.state = {
        ghostPairs: [],
    };
}
