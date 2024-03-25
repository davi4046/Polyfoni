import type StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import {
    countAncestors,
    getIndex,
    getParent,
} from "../../architecture/state-hierarchy-utils";
import type { ItemState } from "../timeline/models/Item";
import type Item from "../timeline/models/Item";
import type Timeline from "../timeline/models/Timeline";
import type Track from "../timeline/models/Track";
import { trackIndexToType } from "../timeline/utils/track-config";

import compareArrays from "./compareArrays";

export default class TotalHarmonyGenerator {
    private _itemChanges: ItemChange[] = [];
    private _isHandlingChanges = false;

    private _totalHarmonyItems: Item<"ChordItem">[] = [];

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        watcher.subscribe((obj, oldState) => {
            const objDepth = countAncestors(obj);
            const newState = obj.state as any;

            switch (objDepth) {
                // Track
                case 3: {
                    const trackType = trackIndexToType(
                        getIndex(obj as Track<any>)
                    );
                    if (trackType !== "output" && trackType !== "harmony") {
                        return;
                    }

                    const { removedItems, addedItems } = compareArrays<
                        Item<any>
                    >(oldState.children, newState.children);

                    this._itemChanges.push(
                        ...removedItems.map((item) => {
                            return {
                                oldState: item.state,
                                newState: undefined,
                            };
                        }),
                        ...addedItems.map((item) => {
                            return {
                                oldState: undefined,
                                newState: item.state,
                            };
                        })
                    );
                    break;
                }
                // Item
                case 4: {
                    const trackType = trackIndexToType(
                        getIndex(getParent(obj as Item<any>))
                    );
                    if (trackType !== "output" && trackType !== "harmony") {
                        return;
                    }

                    this._itemChanges.push({ oldState, newState });
                    break;
                }
            }

            if (this._itemChanges.length > 0 && !this._isHandlingChanges) {
                const handleNextChangeLoop = () => {
                    let nextChange = this._itemChanges.shift();

                    if (nextChange) {
                        this._handleChange(nextChange).then(
                            handleNextChangeLoop
                        );
                    } else {
                        this._isHandlingChanges = false;
                        // render output
                    }
                };
                this._isHandlingChanges = true;
                handleNextChangeLoop();
            }
        });
    }

    private async _handleChange(change: ItemChange) {
        if (change.oldState) await this._clearItemStateEffect(change.oldState);
        if (change.newState) await this._applyItemStateEffect(change.newState);
    }

    private async _clearItemStateEffect(itemState: ItemState<any>) {
        const trackType = trackIndexToType(getIndex(itemState.parent));

        switch (trackType) {
            case "output": {
                break;
            }
            case "harmony": {
                break;
            }
        }
    }

    private async _applyItemStateEffect(itemState: ItemState<any>) {
        const trackType = trackIndexToType(getIndex(itemState.parent));

        switch (trackType) {
            case "output": {
                break;
            }
            case "harmony": {
                break;
            }
        }
    }
}

type StateChange<TState> = {
    oldState: TState;
    newState: TState;
};

type ItemChange = StateChange<ItemState<any> | undefined>;
