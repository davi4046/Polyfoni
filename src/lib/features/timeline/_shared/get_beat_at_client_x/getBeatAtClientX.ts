import Attribute from "../../../../shared/architecture/AttributeEnum";

import type Timeline from "../../models/timeline/Timeline";

function getBeatAtClientX(timeline: Timeline, clientX: number): number {
    const timelineElement = document.querySelector(
        `[${Attribute.ModelId}='${timeline.id}']`
    )!;

    const centerElement = timelineElement.querySelector(
        `[${Attribute.Type}='center']`
    ) as HTMLElement;

    return (clientX - centerElement.offsetLeft + centerElement.scrollLeft) / 64;
}

export default getBeatAtClientX;
