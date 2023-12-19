class MouseEventListener {
    private _handler?: MouseEventHandler;
    private _clickedPoint?: Point;

    set handler(newHandler: MouseEventHandler) {
        if (this._clickedPoint) return; //avoid handler updating when dragging
        this._handler = newHandler;
    }

    constructor() {
        document.addEventListener(
            "mousedown",
            (event) => {
                this._clickedPoint = { x: event.clientX, y: event.clientY };
                this._handler?.handleMouseDown(this._clickedPoint);
            },
            true //listen for event in capture phase
        );

        document.addEventListener(
            "mouseup",
            (event) => {
                this._handler?.handleMouseUp(
                    { x: event.clientX, y: event.clientY },
                    this._clickedPoint!
                );
                this._clickedPoint = undefined;
            },
            true //listen for event in capture phase
        );

        document.addEventListener(
            "mousemove",
            (event) => {
                console.log("mouse move");
                this._handler?.handleMouseMove(
                    { x: event.clientX, y: event.clientY },
                    this._clickedPoint
                );
            },
            true //listen for event in capture phase
        );
    }
}

export default new MouseEventListener();
