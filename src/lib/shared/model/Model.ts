import IdProvider from "../id_provider/IdProvider";
import Stateful from "../stateful/Stateful";
import Subscribable from "../subscribable/Subscribable";

class Model<TState extends object> {
    private _id = IdProvider.generateId();
    private _state: Stateful<TState> & Required<TState>;
    private _subscribable = new Subscribable(this);

    constructor(state: (model: Model<TState>) => Required<TState>) {
        this._state = Stateful.create(state(this));
    }

    get id() {
        return this._id;
    }

    set state(newState: Partial<TState>) {
        this._state.setState(newState);
        this._subscribable.notifySubscribers();
    }

    get state(): Required<TState> {
        return this._state.getState() as Required<TState>;
    }

    subscribe(callback: (value: this) => void) {
        this._subscribable.subscribe(callback);
    }

    notifySubscribers() {
        this._subscribable.notifySubscribers();
    }
}

export default Model;
