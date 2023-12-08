import Subscribable from "../subscribable/Subscribable";

class Stateful<TState extends Object> extends Subscribable {
    constructor(private _state: TState) {
        super();
    }

    set state(newState: TState) {
        this._state = Object.freeze(newState);
    }

    get state() {
        return this._state;
    }
}

export default Stateful;
