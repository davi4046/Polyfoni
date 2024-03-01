import type Track from "../../models/Track";
import { getParent } from "../../../../shared/architecture/state/state-hierarchy-utils";

function groupByVoice<T extends { track: Track<any> }>(objs: T[]): T[][] {
    const groups: T[][] = [];

    if (objs.length === 0) return groups;

    for (const highlight of objs) {
        const group = groups.find((group) => {
            return getParent(group[0].track) === getParent(highlight.track);
        });
        if (group) {
            group.push(highlight); //add to existing group
        } else {
            groups.push([highlight]); //create new group
        }
    }
    return groups;
}

export default groupByVoice;
