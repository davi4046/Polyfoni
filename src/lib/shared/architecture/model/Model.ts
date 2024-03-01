import IdProvider from "../id_provider/IdProvider";
import type { GetState, SetState } from "../state/state_utils";

class Model<TState extends object>
    implements GetState<TState>, SetState<TState>
{
    private _state: TState;

    constructor(
        state: TState,
        readonly id = IdProvider.generateId()
    ) {
        this._state = state;
    }

    set state(newState: Partial<TState>) {
        Object.assign(this._state, newState);
        this._callbacks.forEach((callback) => callback()); //notify subscribers
    }

    get state(): TState {
        return Object.assign({}, this._state);
    }

    private _callbacks: (() => void)[] = [];

    subscribe(callback: () => void) {
        this._callbacks.push(callback);
    }
}

export default Model;
