import IdProvider from "../id_provider/IdProvider";
import Stateful from "../stateful/Stateful";
import Subscribable from "../subscribable/Subscribable";

import type { GetState, SetState } from "../state/state_utils";

class Model<TModel, TState extends object>
    implements GetState<TState>, SetState<TState>
{
    private _id = IdProvider.generateId();
    private _stateful: Stateful<TState> & Required<TState>;
    private _subscribable = new Subscribable(this);

    constructor(createState: (model: TModel) => Required<TState>) {
        this._stateful = Stateful.create(
            createState(this as unknown as TModel)
        );
    }

    get id() {
        return this._id;
    }

    set state(newState: Partial<TState>) {
        this._stateful.setState(newState);
        this._subscribable.notifySubscribers();
    }

    get state(): Required<TState> {
        return this._stateful.getState() as Required<TState>;
    }

    subscribe(callback: (value: this) => void) {
        this._subscribable.subscribe(callback);
    }

    notifySubscribers() {
        this._subscribable.notifySubscribers();
    }
}

export default Model;
