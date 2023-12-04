class ItemVMState {
    constructor(
        private _start: number,
        private _end: number,
        private _text: string,
        private _backgroundColor: chroma.Color,
        private _outlineColor: chroma.Color,
        private _handleMouseDown: (event: MouseEvent) => void
    ) {}

    get start() {
        return this._start;
    }

    get end() {
        return this._end;
    }

    get text() {
        return this._text;
    }

    get backgroundColor() {
        return this._backgroundColor;
    }

    get outlineColor() {
        return this._outlineColor;
    }

    get handleMouseDown() {
        return this._handleMouseDown;
    }
}

export default ItemVMState;
