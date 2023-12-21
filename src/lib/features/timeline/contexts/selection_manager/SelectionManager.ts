import {
    getParent,
    removeChildren,
} from "../../../../shared/state/state_utils";

import type Item from "../../models/item/Item";

class SelectionManager {
    private _selectedItems: Item[] = [];

    get selectedItems() {
        return this._selectedItems;
    }

    readonly selectItem = (item: Item) => {
        if (this._selectedItems.includes(item)) return;
        this._selectedItems.push(item);
        item.notifySubscribers();
    };

    readonly deselectItem = (item: Item) => {
        let index = this._selectedItems.indexOf(item);
        this._selectedItems.splice(index, 1);
        item.notifySubscribers();
    };

    readonly toggleSelected = (item: Item) => {
        if (this._selectedItems.includes(item)) {
            this.deselectItem(item);
        } else {
            this.selectItem(item);
        }
    };

    readonly deselectAll = () => {
        this._selectedItems.slice().forEach((item) => this.deselectItem(item));
    };

    readonly isSelected = (item: Item) => {
        return this._selectedItems.includes(item);
    };

    readonly deleteSelection = () => {
        this._selectedItems.forEach((item) => {
            removeChildren(getParent(item), item);
        });
        this.deselectAll();
    };
}

export default SelectionManager;