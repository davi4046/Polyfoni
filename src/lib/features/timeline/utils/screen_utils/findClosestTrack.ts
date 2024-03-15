import type Timeline from "../../models/Timeline";
import type Track from "../../models/Track";
import Attribute from "../../../../architecture/AttributeEnum";
import type Model from "../../../../architecture/Model";
import { getDescendants } from "../../../../architecture/state-hierarchy-utils";
import findClosestElement from "../../../../utils/dom_utils/findClosestElement";

function findClosestTrack(
    timeline: Timeline,
    clientY: number
): Track<any> | undefined {
    const timelineElement = document.querySelector(
        `[${Attribute.ModelId}='${timeline.id}']`
    )!;
    const trackElements = Array.from(
        timelineElement.querySelectorAll(`[${Attribute.Type}='track']`)
    );

    if (trackElements.length === 0) return;

    const trackElement = findClosestElement(0, clientY, trackElements);
    const modelId = trackElement.getAttribute(Attribute.ModelId)!;

    const model = (getDescendants(timeline) as Model<any>[]).find(
        (child) => child.id === modelId
    ) as Track<any>;

    return model;
}

export default findClosestTrack;
