import Attribute from "../../../architecture/AttributeEnum";
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
        getNestedArrayOfDescendants(timeline, 3).flat(Infinity) as Track<any>[]
    ).filter(predicate ? predicate : () => true);

    const selectors = tracks
        .map((track) => `[${Attribute.ModelId}='${track.id}']`)
        .join(",");

    const trackElements = Array.from(document.querySelectorAll(selectors));
    const trackElement = findClosestElement(0, clientY, trackElements);
    const modelId = trackElement.getAttribute(Attribute.ModelId)!;

    return tracks.find((track) => track.id === modelId);
}
