class GlobalEventListener {
    private _handler?: GlobalEventHandler;

    set handler(newHandler: GlobalEventHandler | undefined) {
        // CAUSES LAG DURING PLAYBACK!!!
        if (newHandler === this._handler) return;

        if (
            this._handler &&
            this._handler.getIsOverwritable &&
            !this._handler.getIsOverwritable()
        ) {
            return;
        }

        document.body.style.cursor = "default";
        this._handler = newHandler;
    }

    constructor() {
        document.addEventListener(
            "mousedown",
            (event) => {
                if (this._handler?.handleMouseDown) {
                    this._handler.handleMouseDown(event);
                }
            },
            { capture: true }
        );

        document.addEventListener(
            "mouseup",
            (event) => {
                if (this._handler?.handleMouseUp) {
                    this._handler.handleMouseUp(event);
                }
            },
            { capture: true }
        );

        document.addEventListener(
            "mousemove",
            (event) => {
                if (this._handler?.handleMouseMove) {
                    this._handler.handleMouseMove(event);
                }
            },
            { capture: true }
        );

        document.addEventListener(
            "keydown",
            (event) => {
                if (this._handler?.handleKeyDown) {
                    this._handler.handleKeyDown(event);
                }
            },
            { capture: true }
        );

        document.addEventListener(
            "keyup",
            (event) => {
                if (this._handler?.handleKeyUp) {
                    this._handler.handleKeyUp(event);
                }
            },
            { capture: true }
        );

        document.addEventListener(
            "contextmenu",
            (event) => {
                if (this._handler?.handleContextMenu) {
                    this._handler.handleContextMenu(event);
                }
            },
            { capture: true }
        );
    }
}

export const globalEventListener = new GlobalEventListener();

export interface GlobalEventHandler {
    getIsOverwritable?: () => boolean;

    handleMouseDown?: (event: MouseEvent) => void;
    handleMouseUp?: (event: MouseEvent) => void;
    handleMouseMove?: (event: MouseEvent) => void;
    handleContextMenu?: (event: MouseEvent) => void;

    handleKeyDown?: (event: KeyboardEvent) => void;
    handleKeyUp?: (event: KeyboardEvent) => void;
}
