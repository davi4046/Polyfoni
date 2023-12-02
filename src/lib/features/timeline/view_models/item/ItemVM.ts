class ItemVM {
    constructor(
        private _start: number,
        private _end: number,
        private _text: string,
        private _handleMouseDown?: (event: MouseEvent) => void
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

    get handleMouseDown() {
        return this._handleMouseDown;
    }
}

export default ItemVM;
