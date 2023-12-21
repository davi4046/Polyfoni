import { getParent } from "../../../shared/state/state_utils";
import clearTrackInterval from "../utils/clear_track_interval/clearTrackInterval";
import getBeatAtClientX from "../utils/get_beat_at_client_x/getBeatAtClientX";

import type MouseEventHandler from "../../../shared/mouse_event_listener/MouseEventHandler";
import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";

class EndHandleHandler implements MouseEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item
    ) {}

    handleMouseDown(downEvent: MouseEvent) {}

    handleMouseMove(moveEvent: MouseEvent, downEvent?: MouseEvent) {
        if (!downEvent) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, moveEvent.clientX)
        );

        this.item.state = {
            end: Math.max(hoveredBeat, this.item.state.start + 1),
        };
    }

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {
        clearTrackInterval(
            getParent(this.item),
            this.item.state.start,
            this.item.state.end,
            [this.item]
        );
    }
}

export default EndHandleHandler;
