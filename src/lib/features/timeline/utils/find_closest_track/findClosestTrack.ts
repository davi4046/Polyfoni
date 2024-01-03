import Attribute from "../../../../shared/architecture/AttributeEnum";
import findClosestElement from "../../../../shared/utils/find_closest_element/findClosestElement";
import findModelById from "../../../../shared/utils/find_model_by_id/findModelById";

import type Timeline from "../../models/timeline/Timeline";
import type Track from "../../models/track/Track";

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
