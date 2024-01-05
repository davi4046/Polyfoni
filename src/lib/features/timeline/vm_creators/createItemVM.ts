import chroma from "chroma-js";

import mouseEventListener from "../../../shared/architecture/mouse_event_listener/MouseEventListener";
import { toStringFunctions } from "../models/_shared/item_types/toStringFunctions";
import EndHandleHandler from "../mouse_event_handlers/EndHandleHandler";
import ItemHandler from "../mouse_event_handlers/ItemHandler";
import StartHandleHandler from "../mouse_event_handlers/StartHandleHandler";
import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";

import type { ToStringFunctions } from "../models/_shared/item_types/toStringFunctions";
import type TimelineContext from "../context/TimelineContext";
import type ItemTypes from "../models/_shared/item_types/ItemTypes";
import type Item from "../models/item/Item";

function createItemVM<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const itemHandler = new ItemHandler(context, model);
    const startHandleHandler = new StartHandleHandler(context, model);
    const endHandleHandler = new EndHandleHandler(context, model);

    const update = (model: Item<T>) => {
        const handleMouseMove = (event: MouseEvent) => {
            mouseEventListener.handler = itemHandler;
            event.stopPropagation();
        };

        const handleMouseMove_startHandle = (event: MouseEvent) => {
            mouseEventListener.handler = startHandleHandler;
            event.stopPropagation();
        };

        const handleMouseMove_endHandle = (event: MouseEvent) => {
            mouseEventListener.handler = endHandleHandler;
            event.stopPropagation();
        };

        const createText = toStringFunctions[model.itemType];

        return createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: createText(model.state.content),
            ...(context.selectionManager.isSelected(model)
                ? { outlineColor: chroma.hcl(240, 80, 80) }
                : {}),
            handleMouseMove: handleMouseMove,
            handleMouseMove_startHandle: handleMouseMove_startHandle,
            handleMouseMove_endHandle: handleMouseMove_endHandle,
        });
    };

    return new ItemVM(model, update, {});
}

export default createItemVM;
