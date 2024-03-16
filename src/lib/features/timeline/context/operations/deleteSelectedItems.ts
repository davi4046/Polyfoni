import type TimelineContext from "../TimelineContext";
import {
    getParent,
    removeChildren,
} from "../../../../architecture/state-hierarchy-utils";

export default function deleteSelectedItems(context: TimelineContext) {
    context.state.selectedItems.forEach((item) => {
        removeChildren(getParent(item), item);
    });
    context.state = {
        selectedItems: [],
    };
}
