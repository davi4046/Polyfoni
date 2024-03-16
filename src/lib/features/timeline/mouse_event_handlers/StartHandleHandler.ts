import { clamp } from "lodash";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import getBeatAtClientX from "../utils/screen_utils/getBeatAtClientX";
import type { MouseEventHandler } from "../../../architecture/mouse-event-handling";
import { getParent } from "../../../architecture/state-hierarchy-utils";

export default class StartHandleHandler implements MouseEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item<any>
    ) {}

    handleMouseMove(moveEvent: MouseEvent, downEvent?: MouseEvent) {
        document.body.style.cursor = "e-resize";

        if (!downEvent) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, moveEvent.clientX)
        );

        const newStart = clamp(hoveredBeat, 0, this.item.state.end - 1);

        if (newStart !== this.item.state.start) {
            this.item.state = {
                start: newStart,
            };
        }
    }

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {
        getParent(this.item).cropItemsByInterval(
            this.item.state.start,
            this.item.state.end,
            [this.item]
        );
    }
}
