import { isEqual } from "lodash";

import type { Subscription, SubscriptionCallback } from "./Stateful";
import type Stateful from "./Stateful";
import {
    getChildren,
    isDescendant,
    type ParentState,
} from "./state-hierarchy-utils";

export default class StateHierarchyWatcher<T extends Stateful<any>> {
    constructor(root: T) {
        if (root.state.children) {
            this._watchRecursively(root);
        } else {
            this._watchNonRecursively(root);
        }
    }

    private _callbacks: SubscriptionCallback<any>[] = [];

    subscribe(callback: SubscriptionCallback<any>): Subscription<any> {
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

    getWatchedObjects(): object[] {
        return this._subscriptions.map((subscription) => subscription.obj);
    }

    private _subscriptions: Subscription[] = [];

    private _reportStateChange(obj: Stateful<any>, oldState: any) {
        this._callbacks.forEach((callback) => callback(obj, oldState));
    }

    private _watchNonRecursively(obj: Stateful<any>) {
        const subscription = obj.subscribe((_, oldState) => {
            if (isEqual(oldState, obj.state)) return;
            this._reportStateChange(obj, oldState);
        });

        this._subscriptions.push(subscription);
    }

    private _watchRecursively(obj: Stateful<ParentState<Stateful<any>>>) {
        getChildren(obj).forEach((child) => {
            if (child.state.children) {
                this._watchRecursively(child);
            } else {
                this._watchNonRecursively(child);
            }
        });

        const subscription = obj.subscribe((_, oldState) => {
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

            this._reportStateChange(obj, oldState);

            for (const addedChild of addedChildren) {
                const subscription = this._subscriptions.find(
                    (subscription) => subscription.obj === addedChild
                );

                if (subscription) {
                    throw new Error(
                        "An object which is already subscribed to by HistoryManager " +
                            "has been added to children of another object (meaning the " +
                            "object is referenced in two children arrays, or there is a " +
                            "cyclic reference). This is not allowed!"
                    );
                }

                if (addedChild.state.children) {
                    this._watchRecursively(addedChild);
                } else {
                    this._watchNonRecursively(addedChild);
                }
            }

            for (const removedChild of removedChildren) {
                this._subscriptions = this._subscriptions.filter(
                    (subscription) => {
                        const isRelatedSubscription =
                            subscription.obj === removedChild ||
                            isDescendant(subscription.obj, removedChild);

                        if (isRelatedSubscription) {
                            subscription.unsubscribe();
                        }

                        return !isRelatedSubscription;
                    }
                );
            }
        });

        this._subscriptions.push(subscription);
    }
}
