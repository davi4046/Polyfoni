class GlobalEventListener {
    private _handler?: GlobalEventHandler;
    private _downEvent?: MouseEvent;

    set handler(newHandler: GlobalEventHandler | undefined) {
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
            { capture: true }
        );

        document.addEventListener(
            "mouseup",
            (event) => {
                if (this._handler?.handleMouseUp)
                    this._handler.handleMouseUp(event);
                this._downEvent = undefined;
            },
            { capture: true }
        );

        document.addEventListener(
            "mousemove",
            (event) => {
                if (this._handler?.handleMouseMove)
                    this._handler.handleMouseMove(event);
            },
            { capture: true }
        );
    }
}

export const globalEventListener = new GlobalEventListener();

export interface GlobalEventHandler {
    handleMouseDown?: (event: MouseEvent) => void;
    handleMouseMove?: (event: MouseEvent) => void;
    handleMouseUp?: (event: MouseEvent) => void;
}
