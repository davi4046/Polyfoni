import IdProvider from "../id_provider/IdProvider";
import Subscribable from "../subscribable/Subscribable";

import type { GetState, SetState } from "../state/state_utils";

class Model<TState extends object>
    implements GetState<TState>, SetState<TState>
{
    private _state: TState;
    private _subscribable = new Subscribable();

    constructor(
        state: TState,
        readonly id = IdProvider.generateId()
    ) {
        this._state = state;
    }

    set state(newState: Partial<TState>) {
        Object.assign(this._state, newState);
        this._subscribable.notifySubscribers();
    }

    get state(): TState {
        return Object.assign({}, this._state);
    }

    subscribe(callback: () => void) {
        this._subscribable.subscribe(callback);
    }

    notifySubscribers() {
        this._subscribable.notifySubscribers();
    }
}

export default Model;
