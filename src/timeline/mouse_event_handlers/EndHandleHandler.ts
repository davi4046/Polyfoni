import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import cropItemsByInterval from "../utils/cropItemsByInterval";
import getBeatAtClientX from "../utils/screen_utils/getBeatAtClientX";
import type { MouseEventHandler } from "../../../architecture/mouse-event-handling";
import { getParent } from "../../architecture/state-hierarchy-utils";

export default class EndHandleHandler implements MouseEventHandler {
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

        const newEnd = Math.max(hoveredBeat, this.item.state.start + 1);

        if (newEnd !== this.item.state.end) {
            this.item.state = {
                end: newEnd,
            };
        }
    }

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {
        const track = getParent(this.item);
        const otherItems = track.state.children.filter(
            (item) => item !== this.item
        );
        track.state = {
            children: cropItemsByInterval(otherItems, this.item.state).concat(
                this.item
            ),
        };
    }
}
