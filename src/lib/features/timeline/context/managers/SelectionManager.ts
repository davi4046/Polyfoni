import type Item from "../../models/Item";
import Stateful from "../../../../shared/architecture/stateful/Stateful";

interface SelectionManagerState {
    selectedItems: Item<any>[];
}

class SelectionManager extends Stateful<SelectionManagerState> {
    constructor() {
        super({ selectedItems: [] });
    }

    selectItem(item: Item<any>) {
        if (this.state.selectedItems.includes(item)) return;
        this.state = {
            selectedItems: this.state.selectedItems.concat(item),
        };
    }

    deselectItem(item: Item<any>) {
        this.state = {
            selectedItems: this.state.selectedItems.filter(
                (selectedItem) => selectedItem !== item
            ),
        };
    }

    toggleSelected(item: Item<any>) {
        if (this.state.selectedItems.includes(item)) {
            this.deselectItem(item);
        } else {
            this.selectItem(item);
        }
    }

    deselectAll() {
        this.state = {
            selectedItems: [],
        };
    }

    isSelected(item: Item<any>) {
        return this.state.selectedItems.includes(item);
    }
}

export default SelectionManager;
