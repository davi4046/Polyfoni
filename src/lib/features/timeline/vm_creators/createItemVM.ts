import chroma from "chroma-js";

import mouseEventListener from "../../../shared/mouse_event_listener/MouseEventListener";
import EndHandleHandler from "../mouse_event_handlers/EndHandleHandler";
import ItemHandler from "../mouse_event_handlers/ItemHandler";
import StartHandleHandler from "../mouse_event_handlers/StartHandleHandler";
import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";

import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";

function createItemVM(model: Item, context: TimelineContext): ItemVM {
    const itemHandler = new ItemHandler(context, model);
    const startHandleHandler = new StartHandleHandler(context, model);
    const endHandleHandler = new EndHandleHandler(context, model);

    const update = (model: Item) => {
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

        return createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: model.state.content,
            ...(context.selection.isSelected(model)
                ? { outlineColor: chroma.hcl(240, 80, 80) }
                : {}),
            handleMouseMove: handleMouseMove,
            handleMouseMove_startHandle: handleMouseMove_startHandle,
            handleMouseMove_endHandle: handleMouseMove_endHandle,
        });
    };

    return new ItemVM(model, update);
}

export default createItemVM;
