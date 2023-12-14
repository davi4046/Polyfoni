import type Item from "../models/item/Item";

class SelectionContext {
    private _selectedItems: Item[] = [];

    get selectedItems() {
        return this._selectedItems;
    }

    readonly selectItem = (item: Item) => {
        if (this._selectedItems.includes(item)) return;
        this._selectedItems.push(item);
        item._subscribable.notifySubscribers();
    };

    readonly deselectItem = (item: Item) => {
        let index = this._selectedItems.indexOf(item);
        this._selectedItems.splice(index, 1);
        item._subscribable.notifySubscribers();
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
