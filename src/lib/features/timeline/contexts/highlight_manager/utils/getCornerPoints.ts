import { getGreatGrandparent } from "../../../../../shared/state/state_utils";
import Attribute from "../../../../../shared/utils/AttributeEnum";
import getClientXAtBeat from "../../../utils/get_client_x_at_beat/getClientXAtBeat";

import type Highlight from "./Highlight";

function getCornerPoints(highlight: Highlight) {
    const x1 = getClientXAtBeat(
        getGreatGrandparent(highlight.track),
        highlight.start
    );
    const x2 = getClientXAtBeat(
        getGreatGrandparent(highlight.track),
        highlight.end
    );

    const rect = document
        .querySelector(`[${Attribute.ModelId}='${highlight.track.id}']`)!
        .getBoundingClientRect();

    const y1 = rect.top;
    const y2 = rect.bottom;

    return [
        { x: x1, y: y1 },
        { x: x1, y: y2 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
    ];
}

export default getCornerPoints;
