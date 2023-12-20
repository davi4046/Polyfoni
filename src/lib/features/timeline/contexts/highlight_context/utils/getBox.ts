import { getGreatGrandparent } from "../../../../../shared/state/state_utils";
import Attribute from "../../../../../shared/utils/AttributeEnum";
import getClientXAtBeat from "../../../utils/get_client_x_at_beat/getClientXAtBeat";

import type Highlight from "./Highlight";

function getBox(highlight: Highlight) {
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

    return { x1, y1, x2, y2 };
}

export default getBox;
