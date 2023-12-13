interface DragBehaviour {
    drag: (fromX: number, toX: number, fromY: number, toY: number) => void;
    drop: () => void;
}

export type { DragBehaviour as default };
