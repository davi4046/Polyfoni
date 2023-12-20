import { getIndex } from "../../../../../shared/state/state_utils";
import Highlight from "./Highlight";

function groupByIndex(highlights: Highlight[]): Highlight[][] {
    const groups: Highlight[][] = [];

    if (highlights.length === 0) return groups;

    highlights.sort((a, b) => getIndex(a.track) - getIndex(b.track));

    groups.push([highlights[0]]);

    for (let i = 1; i < highlights.length; i++) {
        const prevIndex = getIndex(highlights[i - 1].track);
        const currIndex = getIndex(highlights[i].track);

        if (prevIndex === currIndex - 1) {
            groups[groups.length - 1].push(highlights[i]);
        } else {
            groups.push([highlights[i]]);
        }
    }
    return groups;
}

export default groupByIndex;
