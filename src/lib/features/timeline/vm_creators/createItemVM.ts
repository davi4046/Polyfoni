import chroma from "chroma-js";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import EndHandleHandler from "../mouse_event_handlers/EndHandleHandler";
import ItemHandler from "../mouse_event_handlers/ItemHandler";
import StartHandleHandler from "../mouse_event_handlers/StartHandleHandler";
import { stringConversionFunctions, type ItemTypes } from "../utils/ItemTypes";
import ItemVM from "../view_models/ItemVM";
import { mouseEventListener } from "../../../shared/architecture/mouse-event-handling";

export default function createItemVM<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const itemHandler = new ItemHandler(context, model);
    const startHandleHandler = new StartHandleHandler(context, model);
    const endHandleHandler = new EndHandleHandler(context, model);

    const vm = new ItemVM(
        {
            start: model.state.start,
            end: model.state.end,
            text: stringConversionFunctions[model.itemType](
                model.state.content
            ),

            opacity: 1,
            backgroundColor: chroma.hcl(0, 0, 80),
            outlineColor: context.selectionManager.isSelected(model)
                ? chroma.hcl(240, 80, 80)
                : chroma.hcl(0, 0, 0, 0),

            handleMouseMove: (event: MouseEvent) => {
                mouseEventListener.handler = itemHandler;
                event.stopPropagation();
            },
            handleMouseMove_startHandle: (event: MouseEvent) => {
                mouseEventListener.handler = startHandleHandler;
                event.stopPropagation();
            },
            handleMouseMove_endHandle: (event: MouseEvent) => {
                mouseEventListener.handler = endHandleHandler;
                event.stopPropagation();
            },
        },
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
