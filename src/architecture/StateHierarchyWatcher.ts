import type { UnsubscribeFn } from "./Stateful";
import type Stateful from "./Stateful";
import {
    getChildren,
    getDescendants,
    type ParentState,
} from "./state-hierarchy-utils";

type MultiSubscriberFn = (obj: any, oldState: any, newState: any) => void;

export default class StateHierarchyWatcher<T extends Stateful<any>> {
    constructor(readonly root: T) {
        if (root.state.children) {
            this._watchRecursively(root);
        } else {
            this._watchNonRecursively(root);
        }
    }

    private _callbacks: MultiSubscriberFn[] = [];

    subscribe(callback: MultiSubscriberFn): UnsubscribeFn {
        this._callbacks.push(callback);

        return () => {
            this._callbacks = this._callbacks.filter(
                (func) => func !== callback
            );
        };
    }

    private _subscriptions = new Map<object, UnsubscribeFn>();

    private async _reportStateChange(obj: any, oldState: any, newState: any) {
        for (const callback of this._callbacks) {
            await callback(obj, oldState, newState);
        }
    }

    private _watchNonRecursively(obj: Stateful<any>) {
        const unsubscribe = obj.subscribe((oldState, newState) =>
            this._reportStateChange(obj, oldState, newState)
        );

        this._subscriptions.set(obj, unsubscribe);
    }

    private _watchRecursively(obj: Stateful<ParentState<Stateful<any>>>) {
        getChildren(obj).forEach((child) => {
            if (child.state.children) {
                this._watchRecursively(child);
            } else {
                this._watchNonRecursively(child);
            }
        });

        const unsubscribe = obj.subscribe((oldState, newState) => {
            const oldChildren = oldState.children;
            const newChildren = getChildren(obj);

            // Objects that are children in new state, but not in old state
            const addedChildren = newChildren.filter(
                (child) => !oldChildren.includes(child)
            );

            // Objects that are children in old state, but not in new state
            const removedChildren = oldChildren.filter(
                (child) => !newChildren.includes(child)
            );

            this._reportStateChange(obj, oldState, newState);

            for (const addedChild of addedChildren) {
                if (this._subscriptions.has(addedChild)) return;

                if (addedChild.state.children) {
                    this._watchRecursively(addedChild);
                } else {
                    this._watchNonRecursively(addedChild);
                }
            }

            for (const removedChild of removedChildren) {
                const descendants = getDescendants(removedChild);

                [removedChild, ...descendants].forEach((obj) => {
                    this._subscriptions.delete(obj);
                });
            }
        });

        this._subscriptions.set(obj, unsubscribe);
    }
}
