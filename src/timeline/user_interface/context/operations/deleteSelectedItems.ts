import type TimelineContext from "../TimelineContext";
import {
    getParent,
    removeChildren,
} from "../../../../architecture/state-hierarchy-utils";
import type Item from "../../../models/item/Item";

export default function deleteSelectedItems(context: TimelineContext) {
    const removedItems: Item<any>[] = [];

    context.state.selectedItems.forEach((item) => {
        removeChildren(getParent(item), item);
        removedItems.push(item);
    });
    context.state = {
        selectedItems: [],
    };

    return removedItems;
}
