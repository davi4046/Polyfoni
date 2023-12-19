import { clamp } from "lodash";

import { getParent } from "../../../shared/state/state_utils";
import clearTrackInterval from "../utils/clear_track_interval/clearTrackInterval";
import getBeatAtClientX from "../utils/get_beat_at_client_x/getBeatAtClientX";

import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";

class StartHandleHandler implements MouseEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item
    ) {}

    handleMouseDown(clickedPoint: Point) {}

    handleMouseMove(hoveredPoint: Point, clickedPoint?: Point) {
        console.log("start handle!");
        if (!clickedPoint) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, hoveredPoint.x)
        );

        this.item.state = {
            start: clamp(hoveredBeat, 0, this.item.state.end - 1),
        };
    }

    handleMouseUp(hoveredPoint: Point, clickedPoint: Point) {
        clearTrackInterval(
            getParent(this.item),
            this.item.state.start,
            this.item.state.end,
            [this.item]
        );
    }
}

export default StartHandleHandler;
