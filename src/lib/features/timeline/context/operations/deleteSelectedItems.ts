import {
    getParent,
    removeChildren,
} from "../../../../shared/architecture/state/state_utils";

import type TimelineContext from "../TimelineContext";

function deleteSelectedItems(context: TimelineContext) {
    context.selectionManager.selectedItems.forEach((item) => {
        removeChildren(getParent(item), item);
    });
    context.selectionManager.deselectAll();
}

export default deleteSelectedItems;
