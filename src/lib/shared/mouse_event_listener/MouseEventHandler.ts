interface MouseEventHandler {
    handleMouseDown: (downEvent: MouseEvent) => void;
    handleMouseMove: (moveEvent: MouseEvent, downEvent?: MouseEvent) => void;
    handleMouseUp: (upEvent: MouseEvent, downEvent: MouseEvent) => void;
}

export type { MouseEventHandler as default };
