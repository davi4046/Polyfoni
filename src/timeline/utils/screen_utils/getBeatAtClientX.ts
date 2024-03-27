import type Timeline from "../../models/Timeline";
import Attribute from "../../../lib/architecture/AttributeEnum";

export default function getBeatAtClientX(
    timeline: Timeline,
    clientX: number
): number {
    const timelineElement = document.querySelector(
        `[${Attribute.ModelId}='${timeline.id}']`
    )!;

    const centerElement = timelineElement.querySelector(
        `[${Attribute.Type}='center']`
    ) as HTMLElement;

    return (clientX - centerElement.offsetLeft + centerElement.scrollLeft) / 64;
}
