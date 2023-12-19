import type TimelineContext from "../contexts/TimelineContext";

class TimelineHandler implements MouseEventHandler {
    constructor(readonly context: TimelineContext) {}

    handleMouseDown(downEvent: MouseEvent) {
        if (downEvent.shiftKey) return;
        this.context.selection.deselectAll();
    }

    handleMouseMove(moveEvent: MouseEvent, downEvent?: MouseEvent) {}

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {}
}

export default TimelineHandler;
