import findElementByModelId from "../../../../shared/utils/find_element_by_model_id/findElementByModelId";

import type Timeline from "../../models/timeline/Timeline";

function getBeatAtClientX(timeline: Timeline, clientX: number) {
    const timelineElement = findElementByModelId(
        document.documentElement,
        timeline.id
    );

    const centerElement = timelineElement.querySelector(
        "[data-type='center']"
    ) as HTMLElement;

    const absoluteX =
        clientX - centerElement.offsetLeft + centerElement.scrollLeft;

    return absoluteX / 64;
}

export default getBeatAtClientX;
