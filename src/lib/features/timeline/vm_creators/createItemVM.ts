import chroma from "chroma-js";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import EndHandleHandler from "../mouse_event_handlers/EndHandleHandler";
import ItemHandler from "../mouse_event_handlers/ItemHandler";
import StartHandleHandler from "../mouse_event_handlers/StartHandleHandler";
import { stringConversionFunctions, type ItemTypes } from "../utils/ItemTypes";
import ItemVM from "../view_models/ItemVM";
import { mouseEventListener } from "../../../architecture/mouse-event-handling";

export default function createItemVM<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const itemHandler = new ItemHandler(context, model);
    const startHandleHandler = new StartHandleHandler(context, model);
    const endHandleHandler = new EndHandleHandler(context, model);

    function createStyles() {
        const styles: Record<string, string> = {
            "background-color": chroma.hcl(0, 0, 80).css(),
            "border-width": "2px",
            "border-color": "black",
            inset: "4px 0 4px 0",
            padding: "0 8px 0 8px",
        };

        if (context.state.selectedItems.includes(model)) {
            styles["outline-style"] = "solid";
            styles["outline-color"] = chroma.hcl(240, 80, 80).css();
        }

        return styles;
    }

    const vm = new ItemVM(
        {
            start: model.state.start,
            end: model.state.end,
            text: stringConversionFunctions[model.itemType](
                model.state.content
            ),

            innerDivStyles: createStyles(),
            handleStyles: {
                "background-color": "black",
                opacity: "0.25",
            },

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

            onDestroy: () => {
                mouseEventListener.handler = undefined;
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

    context.subscribe(() => {
        vm.state = {
            innerDivStyles: createStyles(),
        };
    });

    return vm;
}
