import { clamp } from "lodash";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import getBeatAtClientX from "../utils/screen_utils/getBeatAtClientX";
import type MouseEventHandler from "../../../shared/architecture/mouse_event_listener/MouseEventHandler";
import { getParent } from "../../../shared/architecture/state/state-hierarchy-utils";

class StartHandleHandler implements MouseEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item<any>
    ) {}

    handleMouseMove(moveEvent: MouseEvent, downEvent?: MouseEvent) {
        if (!downEvent) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, moveEvent.clientX)
        );

        this.item.state = {
            start: clamp(hoveredBeat, 0, this.item.state.end - 1),
        };
    }

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {
        getParent(this.item).cropItemsByInterval(
            this.item.state.start,
            this.item.state.end,
            [this.item]
        );
    }
}

export default StartHandleHandler;
