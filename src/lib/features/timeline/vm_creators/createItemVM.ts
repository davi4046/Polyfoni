import chroma from "chroma-js";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import EndHandleHandler from "../mouse_event_handlers/EndHandleHandler";
import ItemHandler from "../mouse_event_handlers/ItemHandler";
import StartHandleHandler from "../mouse_event_handlers/StartHandleHandler";
import {
    itemColorFunctions,
    itemTextFunctions,
    type ItemTypes,
} from "../utils/ItemTypes";
import ItemVM from "../view_models/ItemVM";
import { mouseEventListener } from "../../../architecture/mouse-event-handling";

export default function createItemVM<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const itemHandler = new ItemHandler(context, model);
    const startHandleHandler = new StartHandleHandler(context, model);
    const endHandleHandler = new EndHandleHandler(context, model);

    const baseInnerDivStyles: Record<string, string> = {
        "border-width": "2px",
        "border-color": "black",
        inset: "4px 0 4px 0",
        padding: "0 8px 0 8px",
    };

    const colorFunction = itemColorFunctions[model.itemType];

    function createInnerDivStyles() {
        const innerDivStyles = Object.assign({}, baseInnerDivStyles);

        const customColor = colorFunction
            ? colorFunction(model.state.content)
            : undefined;

        innerDivStyles["background-color"] = customColor
            ? customColor.css()
            : chroma.hcl(0, 0, 80).css();

        if (context.state.selectedItems.includes(model)) {
            innerDivStyles["outline-style"] = "solid";
            innerDivStyles["outline-color"] = chroma.hcl(240, 80, 80).css();
        }

        return innerDivStyles;
    }

    const vm = new ItemVM(
        {
            start: model.state.start,
            end: model.state.end,
            text: itemTextFunctions[model.itemType](model.state.content),

            innerDivStyles: createInnerDivStyles(),
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
            text: itemTextFunctions[model.itemType](model.state.content),
            innerDivStyles: createInnerDivStyles(),
        };
    });

    context.subscribe(() => {
        vm.state = {
            innerDivStyles: createInnerDivStyles(),
        };
    });

    return vm;
}
