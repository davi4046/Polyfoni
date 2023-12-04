import type ItemVM from "../item/ItemVM";

class TrackVMState {
    constructor(
        private _label: string,
        private _items: ItemVM[]
    ) {}

    get label() {
        return this._label;
    }

    get items() {
        return this._items;
    }
}

export default TrackVMState;
