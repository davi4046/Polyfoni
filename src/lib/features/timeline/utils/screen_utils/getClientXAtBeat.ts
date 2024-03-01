import Attribute from "../../../../shared/architecture/AttributeEnum";

import type Timeline from "../../models/Timeline";

function getClientXAtBeat(timeline: Timeline, beat: number): number {
    const timelineElement = document.querySelector(
        `[${Attribute.ModelId}='${timeline.id}']`
    )!;

    const centerElement = timelineElement.querySelector(
        `[${Attribute.Type}='center']`
    ) as HTMLElement;

    return beat * 64 + centerElement.offsetLeft - centerElement.scrollLeft;
}

export default getClientXAtBeat;
