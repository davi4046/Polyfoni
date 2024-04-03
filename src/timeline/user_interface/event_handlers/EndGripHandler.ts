import type TimelineContext from "../context/TimelineContext";
import cropItemsByInterval from "../../utils/cropItemsByInterval";
import type { GlobalEventHandler } from "../../../architecture/mouse-event-handling";
import { getParent } from "../../../architecture/state-hierarchy-utils";
import type Item from "../../models/item/Item";
import getBeatAtClientX from "../../utils/screen_utils/getBeatAtClientX";

export default class EndGripHandler implements GlobalEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item<any>
    ) {}

    private _isMouseDown = false;

    handleMouseDown(event: MouseEvent) {
        this.context.state = {
            selectedGrips: [this.item],
            gripMode: "end",
        };
        this._isMouseDown = true;
    }

    handleMouseMove(event: MouseEvent) {
        document.body.style.cursor = "e-resize";

        if (!this._isMouseDown) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, event.clientX)
        );

        const newEnd = Math.max(hoveredBeat, this.item.state.start + 1);

        if (newEnd !== this.item.state.end) {
            this.item.state = {
                end: newEnd,
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
