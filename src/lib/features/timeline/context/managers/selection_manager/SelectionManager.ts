import type Item from "../../../models/item/Item";

class SelectionManager {
    private _selectedItems: Item<any>[] = [];

    get selectedItems() {
        return this._selectedItems;
    }

    selectItem(item: Item<any>) {
        if (this._selectedItems.includes(item)) return;
        this._selectedItems.push(item);
        item.notifySubscribers();
    }

    deselectItem(item: Item<any>) {
        let index = this._selectedItems.indexOf(item);
        this._selectedItems.splice(index, 1);
        item.notifySubscribers();
    }

    toggleSelected(item: Item<any>) {
        if (this._selectedItems.includes(item)) {
            this.deselectItem(item);
        } else {
            this.selectItem(item);
        }
    }

    deselectAll() {
        this._selectedItems.slice().forEach((item) => this.deselectItem(item));
    }

    isSelected(item: Item<any>) {
        return this._selectedItems.includes(item);
    }
}

export default SelectionManager;
