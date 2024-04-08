import { getNestedArrayOfDescendants } from "../../../architecture/state-hierarchy-utils";
import findClosestElement from "../../../utils/dom-utils";
import type Timeline from "../../../timeline/models/timeline/Timeline";
import type Track from "../../../timeline/models/track/Track";

export default function findClosestTrack(
    timeline: Timeline,
    clientY: number,
    predicate?: (track: Track<any>) => boolean
): Track<any> | undefined {
    const tracks = (
        getNestedArrayOfDescendants(timeline, 4).flat(Infinity) as Track<any>[]
    ).filter(predicate ? predicate : () => true);

    const trackElements = tracks.map(
        (track) => document.getElementById(track.id + "-root")!
    );
    const trackElement = findClosestElement(0, clientY, trackElements);
    const closestTrack = tracks[trackElements.indexOf(trackElement)];

    return closestTrack;
}
