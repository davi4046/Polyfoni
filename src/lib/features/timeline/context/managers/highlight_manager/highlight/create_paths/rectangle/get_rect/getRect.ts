import Attribute from "../../../../../../../../../shared/architecture/AttributeEnum";
import getRelativeRect from "./get_relative_rect/getRelativeRect";

import type Highlight from "../../../Highlight";
import type Rectangle from "../Rectangle";

function getRect(highlight: Highlight): Rectangle {
    const x1 = highlight.start * 64;
    const x2 = highlight.end * 64;

    const trackElement = document.querySelector(
        `[${Attribute.ModelId}='${highlight.track.id}']`
    ) as HTMLElement;

    const rect = getRelativeRect(
        trackElement,
        trackElement.parentElement!.parentElement!
    );

    const y1 = rect.top;
    const y2 = rect.bottom;

    return { x1, y1, x2, y2 };
}

export default getRect;
