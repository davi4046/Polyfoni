import findElementByModelId from "../../../../shared/utils/find_element_by_model_id/findElementByModelId";

import type Timeline from "../../models/timeline/Timeline";

function getBeatAtClientX(timeline: Timeline, clientX: number): number {
    const timelineElement = findElementByModelId(timeline.id)!;

    const centerElement = timelineElement.querySelector(
        "[data-type='center']"
    ) as HTMLElement;

    return clientX / 64 - centerElement.offsetLeft + centerElement.scrollLeft;
}

export default getBeatAtClientX;
