import chroma from "chroma-js";

import ItemDrag from "../behaviours/item_drag/ItemDrag";
import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";

import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";

function createItemVM(model: Item, context: TimelineContext): ItemVM {
    const dragBehaviour = new ItemDrag(context);

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

        return createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: model.state.content,
            ...(context.selection.isSelected(model)
                ? { outlineColor: chroma.hcl(240, 80, 80) }
                : {}),
            handleMouseDown: handleMouseDown,
        });
    };

    return new ItemVM(model, update);
}

export default createItemVM;
