import type Item from "../../../models/item/Item";

class SelectionManager {
    private _selectedItems: Item[] = [];

    get selectedItems() {
        return this._selectedItems;
    }

    selectItem(item: Item) {
        if (this._selectedItems.includes(item)) return;
        this._selectedItems.push(item);
        item.notifySubscribers();
    }

    deselectItem(item: Item) {
        let index = this._selectedItems.indexOf(item);
        this._selectedItems.splice(index, 1);
        item.notifySubscribers();
    }

    toggleSelected(item: Item) {
        if (this._selectedItems.includes(item)) {
            this.deselectItem(item);
        } else {
            this.selectItem(item);
        }
    }

    deselectAll() {
        this._selectedItems.slice().forEach((item) => this.deselectItem(item));
    }

    isSelected(item: Item) {
        return this._selectedItems.includes(item);
    }
}

export default SelectionManager;
