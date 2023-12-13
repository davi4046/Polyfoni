import type DragBehaviour from "../../../shared/behaviours/drag/DragBehaviour";

class CursorContext {
    private _hoveredX: number | null = null;
    private _hoveredY: number | null = null;
    private _clickedX: number | null = null;
    private _clickedY: number | null = null;

    private _dragBehaviour: DragBehaviour | null = null;

    readonly reportMouseDown = (newDragBehaviour: DragBehaviour | null) => {
        this._clickedX = this._hoveredX;
        this._clickedY = this._hoveredY;
        this._dragBehaviour = newDragBehaviour;
    };

    readonly reportMouseUp = () => {
        this._clickedX = null;
        this._clickedY = null;
        this._dragBehaviour?.drop();
        this._dragBehaviour = null;
    };

    readonly setHoveredPosition = (x: number, y: number) => {
        this._hoveredX = x;
        this._hoveredY = y;

        if (!this._clickedX || !this._clickedY) return;

        this._dragBehaviour?.drag(
            this._clickedX,
            this._hoveredX,
            this._clickedY,
            this._hoveredY
        );
    };
}

export default CursorContext;
