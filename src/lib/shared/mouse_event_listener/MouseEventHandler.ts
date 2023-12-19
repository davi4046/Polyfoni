interface MouseEventHandler {
    handleMouseDown: (clickedPoint: Point) => void;
    handleMouseMove: (hoveredPoint: Point, clickedPoint?: Point) => void;
    handleMouseUp: (hoveredPoint: Point, clickedPoint: Point) => void;
}
