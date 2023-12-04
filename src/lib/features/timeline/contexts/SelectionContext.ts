import type Item from "../models/item/Item";

class SelectionContext {
    private _selectedItems: Item[] = [];

    private _selectItem(item: Item) {
        if (this._selectedItems.includes(item)) return;
        this._selectedItems.push(item);
        item.notifySubscribers();
    }

    private _deselectItem(item: Item) {
        let index = this._selectedItems.indexOf(item);
        this._selectedItems.splice(index, 1);
        item.notifySubscribers();
    }

    private _toggleSelected(item: Item) {
        if (this._selectedItems.includes(item)) {
            this._deselectItem(item);
        } else {
            this._selectItem(item);
        }
    }

    private _deselectAll() {
        this._selectedItems.forEach((item) => this.deselectItem(item));
    }

    private _isSelected(item: Item) {
        return this._selectedItems.includes(item);
    }

    get selectItem() {
        return this._selectItem;
    }

    get deselectItem() {
        return this._deselectItem;
    }

    get toggleSelected() {
        return this._toggleSelected;
    }

    get deselectAll() {
        return this._deselectAll;
    }

    get isSelected() {
        return this._isSelected;
    }
}

export default SelectionContext;
