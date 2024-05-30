import { uniqueId } from "lodash-es";

import type { GetState, SetState } from "./state-hierarchy-utils";

export default class Stateful<TState extends object>
    implements GetState<TState>, SetState<TState>
{
    constructor(state: TState) {
        this._state = state;
    }

    private _state: TState;
    readonly id = uniqueId();

    set state(newState: Partial<TState>) {
        const oldState = this._state;
        const stateClone = Object.assign({}, this._state); // Create a clone of the current state
        Object.assign(stateClone, newState);
        this._state = stateClone;
        this._callbacks.forEach((callback) => callback(oldState, this._state)); //notify subscribers
    }

    get state(): Readonly<TState> {
        return Object.assign({}, this._state);
    }

    private _callbacks: SubscriberFn<TState>[] = [];

    subscribe(callback: SubscriberFn<TState>): UnsubscribeFn {
        this._callbacks.push(callback);

        return () => {
            this._callbacks = this._callbacks.filter(
                (func) => func !== callback
            );
        };
    }
}

export type UnsubscribeFn = () => void;

export type SubscriberFn<TState extends object> =
    | ((oldState: TState, newState: TState) => void)
    | ((oldState: TState, newState: TState) => Promise<void>);
