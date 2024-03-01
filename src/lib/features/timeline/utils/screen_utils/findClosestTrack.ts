import type Timeline from "../../models/Timeline";
import type Track from "../../models/Track";
import Attribute from "../../../../architecture/AttributeEnum";
import findClosestElement from "../../../../utils/dom_utils/findClosestElement";
import findModelById from "../../../../utils/model_utils/findModelById";

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
    const model = findModelById(timeline, modelId) as Track<any>;

    return model;
}

export default findClosestTrack;
