class ItemVM {
    constructor(
        private _start: number,
        private _end: number,
        private _text: string
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
}

export default ItemVM;
