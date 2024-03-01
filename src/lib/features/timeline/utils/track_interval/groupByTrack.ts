import type TrackInterval from "./TrackInterval";

function groupByTrack(highlights: TrackInterval[]): TrackInterval[][] {
    const groups: TrackInterval[][] = [];

    if (highlights.length === 0) return groups;

    for (const highlight of highlights) {
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
