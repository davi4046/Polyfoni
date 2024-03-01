import chroma from "chroma-js";

import type TimelineContext from "../context/TimelineContext";
import EndHandleHandler from "../mouse_event_handlers/EndHandleHandler";
import ItemHandler from "../mouse_event_handlers/ItemHandler";
import StartHandleHandler from "../mouse_event_handlers/StartHandleHandler";
import { stringConversionFunctions, type ItemTypes } from "../utils/ItemTypes";
import type Item from "../models/item/Item";
import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";
import mouseEventListener from "../../../shared/architecture/mouse_event_listener/MouseEventListener";

function createItemVM<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const itemHandler = new ItemHandler(context, model);
    const startHandleHandler = new StartHandleHandler(context, model);
    const endHandleHandler = new EndHandleHandler(context, model);

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

    const vm = new ItemVM(
        createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: stringConversionFunctions[model.itemType](
                model.state.content
            ),
            ...(context.selectionManager.isSelected(model)
                ? { outlineColor: chroma.hcl(240, 80, 80) }
                : {}),
            handleMouseMove: handleMouseMove,
            handleMouseMove_startHandle: handleMouseMove_startHandle,
            handleMouseMove_endHandle: handleMouseMove_endHandle,
        }),
        model.id
    );

    model.subscribe(() => {
        vm.state = {
            start: model.state.start,
            end: model.state.end,
            text: stringConversionFunctions[model.itemType](
                model.state.content
            ),
        };
    });

    context.selectionManager.subscribe(() => {
        vm.state = {
            outlineColor: context.selectionManager.isSelected(model)
                ? chroma.hcl(240, 80, 80)
                : chroma.hcl(0, 0, 0, 0),
        };
    });

    return vm;
}

export default createItemVM;
