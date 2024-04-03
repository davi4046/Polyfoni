import { clamp } from "lodash";

import type TimelineContext from "../context/TimelineContext";
import cropItemsByInterval from "../../utils/cropItemsByInterval";
import type { GlobalEventHandler } from "../../../architecture/GlobalEventListener";
import { getParent } from "../../../architecture/state-hierarchy-utils";
import type Item from "../../models/item/Item";
import getBeatAtClientX from "../../utils/screen_utils/getBeatAtClientX";

export default class StartGripHandler implements GlobalEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item<any>
    ) {}

    private _isMouseDown = false;

    handleMouseDown(event: MouseEvent) {
        this.context.state = {
            selectedGrips: [this.item],
            gripMode: "start",
        };
        this._isMouseDown = true;
    }

    handleMouseMove(event: MouseEvent) {
        document.body.style.cursor = "e-resize";

        if (!this._isMouseDown) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, event.clientX)
        );

        const newStart = clamp(hoveredBeat, 0, this.item.state.end - 1);

        if (newStart !== this.item.state.start) {
            this.item.state = {
                start: newStart,
            };
        }
    }

    handleMouseUp(event: MouseEvent) {
        const track = getParent(this.item);
        const otherItems = track.state.children.filter(
            (item) => item !== this.item
        );
        track.state = {
            children: cropItemsByInterval(otherItems, this.item.state).concat(
                this.item
            ),
        };
        this.context.state = {
            selectedGrips: [],
        };
        this._isMouseDown = false;
    }
}
