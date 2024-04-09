import { getNestedArrayOfDescendants } from "../../../architecture/state-hierarchy-utils";
import findClosestElement from "../../../utils/dom-utils";
import type Timeline from "../../../timeline/models/timeline/Timeline";
import type Track from "../../../timeline/models/track/Track";

export default function findClosestTrack(
    timeline: Timeline,
    clientY: number,
    predicate?: (track: Track<any>) => boolean
): Track<any> | undefined {
    const tracks = getNestedArrayOfDescendants(timeline, 4)
        .flat(Infinity)
        .filter(predicate || (() => true));

    const elements = tracks.map((track) =>
        document.getElementById(track.id + "-root")
    );

    const trackElementMap = new Map(
        tracks.map((track, index) => [elements[index], track])
    );

    const filteredElements = elements.filter(
        (value): value is HTMLElement => value !== null
    );

    const closestElement = findClosestElement(0, clientY, filteredElements);
    const closestTrack = trackElementMap.get(closestElement);

    return closestTrack;
}
