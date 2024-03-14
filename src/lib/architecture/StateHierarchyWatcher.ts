import { isEqual } from "lodash";

import type { Subscription, SubscriptionCallback } from "./Stateful";
import type Stateful from "./Stateful";
import {
    getChildren,
    isDescendant,
    type ParentState,
} from "./state-hierarchy-utils";

export default class StateHierarchyWatcher {
    private _reportStateChange;

    constructor(root: Stateful<any>, callback: SubscriptionCallback<any>) {
        this._reportStateChange = callback;

        if (root.state.children) {
            this._watchRecursively(root);
        } else {
            this._watchNonRecursively(root);
        }
    }

    private _subscriptions: Subscription[] = [];

    private _watchNonRecursively(obj: Stateful<any>) {
        this._reportStateChange(obj, undefined); // Initial report

        const subscription = obj.subscribe((_, oldState) => {
            if (isEqual(oldState, obj.state)) return;
            this._reportStateChange(obj, oldState);
        });

        this._subscriptions.push(subscription);
    }

    private _watchRecursively(obj: Stateful<ParentState<Stateful<any>>>) {
        this._reportStateChange(obj, undefined); // Initial report

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
