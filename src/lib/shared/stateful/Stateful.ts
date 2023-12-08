import Subscribable from "../subscribable/Subscribable";

class Stateful<TState extends object> extends Subscribable {
    constructor(private _state: TState) {
        super();
    }

    protected _setState(newState: TState) {
        this._state = Object.freeze(newState);
    }

    protected _getState() {
        return this._state;
    }
}

export default Stateful;
