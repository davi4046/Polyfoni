import type TimelineContext from "../TimelineContext";
import {
    getParent,
    removeChildren,
} from "../../../../shared/architecture/state/state_utils";

function deleteSelectedItems(context: TimelineContext) {
    context.selectionManager.state.selectedItems.forEach((item) => {
        removeChildren(getParent(item), item);
    });
    context.selectionManager.deselectAll();
}

export default deleteSelectedItems;
