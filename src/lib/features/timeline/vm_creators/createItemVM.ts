import chroma from "chroma-js";

import ItemVM from "../view_models/item/ItemVM";
import ItemVMState from "../view_models/item/ItemVMState";

import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";

function createItemVM(model: Item, context: TimelineContext): ItemVM {
    const update = (model: Item): ItemVMState => {
        const handleMouseDown = (event: MouseEvent) => {
            if (event.shiftKey) {
                context.selection.toggleSelected(model);
            } else {
                context.selection.deselectAll();
                context.selection.selectItem(model);
            }
            context.cursor.reportMouseDown();
            event.stopPropagation();
        };

        return new ItemVMState(
            model.start,
            model.end,
            model.content,
            chroma.hcl(0, 0, 80),
            context.selection.isSelected(model)
                ? chroma.hcl(240, 80, 80)
                : chroma.hcl(0, 0, 0, 0),
            handleMouseDown
        );
    };

    return new ItemVM(model, update);
}

export default createItemVM;
