interface DragBehaviour {
    drag: (fromX: number, fromY: number, toX: number, toY: number) => void;
    drop: () => void;
}

export type { DragBehaviour as default };
