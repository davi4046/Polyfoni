import type { GetState, SetState } from "./state-hierarchy-utils";

export default class Stateful<TState extends object>
    implements GetState<TState>, SetState<TState>
{
    private _state: TState;

    constructor(state: TState) {
        this._state = state;
    }

    set state(newState: Partial<TState>) {
        Object.assign(this._state, newState);
        this._callbacks.forEach((callback) => callback()); //notify subscribers
    }

    get state(): Readonly<TState> {
        return Object.assign({}, this._state);
    }

    private _callbacks: (() => void)[] = [];

    subscribe(callback: () => void) {
        this._callbacks.push(callback);
    }
}
