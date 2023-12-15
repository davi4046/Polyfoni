import findClosestElement from "../../../../shared/utils/find_closest_element/findClosestElement";
import findElementByModelId from "../../../../shared/utils/find_element_by_model_id/findElementByModelId";
import getModelById from "../../../../shared/utils/find_model_by_id/findModelById";
import getModelIdOfElement from "../../../../shared/utils/get_model_id_of_element/getModelIdOfElement";

import type Timeline from "../../models/timeline/Timeline";
import type Track from "../../models/track/Track";

function findClosestTrack(timeline: Timeline, clientY: number): Track | null {
    const timelineElement = findElementByModelId(timeline.id)!;
    const trackElements = Array.from(
        timelineElement.querySelectorAll("[data-type='track']")
    );

    if (trackElements.length === 0) return null;

    const trackElement = findClosestElement(0, clientY, trackElements);
    const modelId = getModelIdOfElement(trackElement);
    const model = getModelById(timeline, modelId) as Track;

    if (!model) {
        throw new Error(`Failed to find track model with id: ${modelId}`);
    }

    return model;
}

export default findClosestTrack;
