import { isEqual } from "lodash";

import type Timeline from "../../models/Timeline";
import type { Subscription } from "../../../../architecture/Stateful";
import type Stateful from "../../../../architecture/Stateful";
import {
    getChildren,
    type ParentState,
    isDescendant,
} from "../../../../architecture/state-hierarchy-utils";

type SavedState<TState extends object = any> = {
    owner: Stateful<TState>;
    state: TState;
};

export default class HistoryManager {
    constructor(timeline: Timeline) {
        this._watchRecursively(timeline);
    }

    private _subscriptions: Subscription[] = [];
    private _history: SavedState[] = [];

    private _saveState(obj: Stateful<any>) {
        const lastSavedState = this._findLastSavedState(obj);

        if (!lastSavedState || !isEqual(obj.state, lastSavedState)) {
            this._history.push({ owner: obj, state: obj.state });
        }
    }

    private _watch(obj: Stateful<any>) {
        this._saveState(obj);
        this._subscriptions.push(obj.subscribe(() => this._saveState(obj)));
    }

    private _watchRecursively<TState extends ParentState<Stateful<any>>>(
        obj: Stateful<TState>
    ) {
        this._saveState(obj);

        getChildren(obj).forEach((child) => {
            if (child.state.children) {
                this._watchRecursively(child);
            } else {
                this._watch(child);
            }
        });

        const subscription = obj.subscribe(() => {
            const lastSavedState = this._findLastSavedState(obj);

            // Objects that are children in current state, but not in saved state
            const addedChildren = lastSavedState
                ? getChildren(obj).filter(
                      (child) => !getChildren(lastSavedState).includes(child)
                  )
                : getChildren(obj);

            // Objects that are children in saved state, but not in current state
            const removedChildren = lastSavedState
                ? getChildren(lastSavedState).filter(
                      (child) => !getChildren(obj).includes(child)
                  )
                : [];

            this._saveState(obj);

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
                    this._watch(addedChild);
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

    private _findLastSavedState<TState extends object>(
        obj: Stateful<TState>
    ): SavedState<TState> | undefined {
        return this._history.findLast((state) => state.owner === obj);
    }
}
