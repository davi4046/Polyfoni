import { isEqual, uniqueId } from "lodash-es";

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

        if (isEqual(this._state, stateClone)) return;

        this._state = stateClone;
        this._callbacks.forEach((callback) => callback(this, oldState)); //notify subscribers
    }

    get state(): Readonly<TState> {
        return Object.assign({}, this._state);
    }

    private _callbacks: SubscriptionCallback<TState>[] = [];

    subscribe(
        callback: SubscriptionCallback<TState>
    ): Subscription<typeof this> {
        this._callbacks.push(callback);

        return {
            obj: this,
            unsubscribe: () => {
                this._callbacks = this._callbacks.filter(
                    (func) => func !== callback
                );
            },
        };
    }
}

export type Subscription<T extends Stateful<any> = any> = {
    obj: T;
    unsubscribe: () => void;
};

export type SubscriptionCallback<TState extends object> =
    | ((obj: Stateful<TState>, oldState: TState) => void)
    | ((obj: Stateful<TState>, oldState: TState) => Promise<void>);
