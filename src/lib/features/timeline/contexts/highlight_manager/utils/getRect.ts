import Attribute from "../../../../../shared/architecture/AttributeEnum";

import type Highlight from "./Highlight";
import type Rectangle from "./Rectangle";

function getRect(highlight: Highlight): Rectangle {
    const x1 = highlight.start * 64;
    const x2 = highlight.end * 64;

    const trackElement = document.querySelector(
        `[${Attribute.ModelId}='${highlight.track.id}']`
    ) as HTMLElement;

    const rect = getRelativeRect(trackElement, trackElement.parentElement!);

    const y1 = rect.top;
    const y2 = rect.bottom;

    return { x1, y1, x2, y2 };
}

export default getRect;

function getRelativeRect(
    element1: HTMLElement,
    element2: HTMLElement
): DOMRect {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const relativeRect = new DOMRect(
        rect1.left - rect2.left,
        rect1.top - rect2.top,
        rect1.width,
        rect1.height
    );

    return relativeRect;
}
