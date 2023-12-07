import chroma from 'chroma-js';

import ViewModel from '../../../shared/view_model/ViewModel';
import { createItemVMState } from '../view_models/item/ItemVMState';

import type ItemVM from "../view_models/item/ItemVM";
import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";

function createItemVM(model: Item, context: TimelineContext): ItemVM {
    const update = (model: Item) => {
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

        return createItemVMState({
            start: model.start,
            end: model.end,
            text: model.content,
            ...(context.selection.isSelected(model)
                ? { outlineColor: chroma.hcl(240, 80, 80) }
                : {}),
            handleMouseDown: handleMouseDown,
        });
    };

    return ViewModel.create(model, update);
}

export default createItemVM;
