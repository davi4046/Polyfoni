import IdProvider from "../id_provider/IdProvider";
import Stateful from "../stateful/Stateful";
import Subscribable from "../subscribable/Subscribable";

class Model<TState extends object> {
    readonly subscribable = new Subscribable(this);
    readonly id = IdProvider.generateId();
    private _state: Stateful<TState> & Required<TState>;

    constructor(state: (model: Model<TState>) => Required<TState>) {
        this._state = Stateful.create(state(this));
    }

    set state(newState: TState) {
        this._state.setState(newState);
        this.subscribable.notifySubscribers();
    }

    get state() {
        return this._state.getState();
    }
}

export default Model;
