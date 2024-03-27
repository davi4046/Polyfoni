class MouseEventListener {
    private _handler?: MouseEventHandler;
    private _downEvent?: MouseEvent;

    set handler(newHandler: MouseEventHandler | undefined) {
        if (this._downEvent) return; //avoid handler updating when dragging

        if (newHandler !== this._handler) {
            document.body.style.cursor = "default";
        }

        this._handler = newHandler;
    }

    constructor() {
        document.addEventListener(
            "mousedown",
            (event) => {
                this._downEvent = event;
                if (this._handler?.handleMouseDown)
                    this._handler.handleMouseDown(event);
            },
            true //listen for event in capture phase
        );

        document.addEventListener(
            "mouseup",
            (event) => {
                if (this._handler?.handleMouseUp)
                    this._handler.handleMouseUp(event, this._downEvent!);
                this._downEvent = undefined;
            },
            true //listen for event in capture phase
        );

        document.addEventListener(
            "mousemove",
            (event) => {
                if (this._handler?.handleMouseMove)
                    this._handler.handleMouseMove(event, this._downEvent);
            },
            true //listen for event in capture phase
        );
    }
}

export const mouseEventListener = new MouseEventListener();

export interface MouseEventHandler {
    handleMouseDown?: (downEvent: MouseEvent) => void;
    handleMouseMove?: (moveEvent: MouseEvent, downEvent?: MouseEvent) => void;
    handleMouseUp?: (upEvent: MouseEvent, downEvent: MouseEvent) => void;
}