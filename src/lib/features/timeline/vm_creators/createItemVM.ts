import chroma from "chroma-js";

import {
    addChildren,
    getParent,
    removeChildren,
} from "../../../shared/state/state_utils";
import ItemDrag from "../behaviours/timeline_drag/item_drag/ItemDrag";
import ItemHandleDrag from "../behaviours/timeline_drag/item_handle_drag/ItemHandleDrag";
import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";

import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";
function createItemVM(model: Item, context: TimelineContext): ItemVM {
    const dragBehaviour = new ItemDrag(context);
    const leftHandleDrag = new ItemHandleDrag(context, model, 0);
    const rightHandleDrag = new ItemHandleDrag(context, model, 1);

    const update = (model: Item) => {
        const handleMouseDown = (event: MouseEvent) => {
            if (event.shiftKey) {
                context.selection.toggleSelected(model);
            } else {
                context.selection.deselectAll();
                context.selection.selectItem(model);
            }
            context.cursor.reportMouseDown(dragBehaviour);
            event.stopPropagation();
        };

        const handleMouseDown_L = (event: MouseEvent) => {
            // Render on top of other items
            removeChildren(getParent(model), model);
            addChildren(getParent(model), model);

            context.cursor.reportMouseDown(leftHandleDrag);
            event.stopPropagation();
        };

        const handleMouseDown_R = (event: MouseEvent) => {
            // Render on top of other items
            removeChildren(getParent(model), model);
            addChildren(getParent(model), model);

            context.cursor.reportMouseDown(rightHandleDrag);
            event.stopPropagation();
        };

        return createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: model.state.content,
            ...(context.selection.isSelected(model)
                ? { outlineColor: chroma.hcl(240, 80, 80) }
                : {}),
            handleMouseDown: handleMouseDown,
            handleMouseDown_L: handleMouseDown_L,
            handleMouseDown_R: handleMouseDown_R,
        });
    };

    return new ItemVM(model, update);
}

export default createItemVM;
