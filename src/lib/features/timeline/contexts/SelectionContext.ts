import Context from "../../../shared/context/Context";

import type Item from "../models/item/Item";
import type Timeline from "../models/timeline/Timeline";

class SelectionContext extends Context<Timeline> {
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
}

export default SelectionContext;
