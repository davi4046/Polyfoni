import type Track from "../../models/Track";

function groupByTrack<T extends { track: Track<any> }>(objs: T[]): T[][] {
    const groups: T[][] = [];

    if (objs.length === 0) return groups;

    for (const highlight of objs) {
        const group = groups.find((group) => {
            return group[0].track === highlight.track;
        });
        if (group) {
            group.push(highlight); //add to existing group
        } else {
            groups.push([highlight]); //create new group
        }
    }
    return groups;
}

export default groupByTrack;
