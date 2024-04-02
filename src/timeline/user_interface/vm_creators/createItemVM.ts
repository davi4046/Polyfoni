import chroma from "chroma-js";

import type { Props } from "tippy.js";

import {
    itemColorFunctions,
    itemTextFunctions,
    itemTooltipContentFunctions,
} from "../item-type-config";
import type TimelineContext from "../context/TimelineContext";
import EndHandleHandler from "../mouse_event_handlers/EndHandleHandler";
import ItemHandler from "../mouse_event_handlers/ItemHandler";
import StartHandleHandler from "../mouse_event_handlers/StartHandleHandler";
import ItemVM from "../view_models/ItemVM";
import { mouseEventListener } from "../../../architecture/mouse-event-handling";
import type Item from "../../models/item/Item";
import { type ItemTypes } from "../../models/item/ItemTypes";

export default function createItemVM<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const itemHandler = new ItemHandler(context, model);
    const startGripHandler = new StartHandleHandler(context, model);
    const endGripHandler = new EndHandleHandler(context, model);

    const colorFunction = itemColorFunctions[model.itemType];
    const tooltipContentFunction = itemTooltipContentFunctions[model.itemType];

    const baseInnerDivStyles: Record<string, string> = {
        "border-width": "2px",
        "border-color": "black",
        inset: "4px 0 4px 0",
        padding: "0 8px 0 8px",
    };

    function createInnerDivStyles() {
        const innerDivStyles = Object.assign({}, baseInnerDivStyles);

        if (model.state.error) {
            innerDivStyles["border-color"] = "#ef4444";
        }

        const bgColor = colorFunction
            ? colorFunction(model.state.content)
            : undefined;

        innerDivStyles["background-color"] = bgColor
            ? bgColor.css()
            : chroma.hcl(0, 0, 80).css();

        if (context.state.selectedItems.includes(model)) {
            innerDivStyles["outline-style"] = "solid";
            innerDivStyles["outline-color"] = chroma.hcl(240, 80, 80).css();
        }

        return innerDivStyles;
    }

    function createTooltip(): Partial<Props> | undefined {
        let content = "";

        if (tooltipContentFunction) {
            content += tooltipContentFunction(model.state.content);
        }

        if (model.state.error) {
            content += `
                <div style="color: pink">Error: ${model.state.error}</div>
            `;
        }

        if (content === "") return;

        return {
            content: content,
            allowHTML: true,
            theme: "material",
        };
    }

    const vm = new ItemVM(
        {
            start: model.state.start,
            end: model.state.end,
            text: itemTextFunctions[model.itemType](model.state.content),
            innerDivStyles: createInnerDivStyles(),
            tooltip: createTooltip(),

            handleStyles: {
                "background-color": "black",
                opacity: "0.25",
            },

            handleMouseMove: (event: MouseEvent) => {
                mouseEventListener.handler = itemHandler;
                event.stopPropagation();
            },
            handleMouseMove_startGrip: (event: MouseEvent) => {
                mouseEventListener.handler = startGripHandler;
                event.stopPropagation();
            },
            handleMouseMove_endGrip: (event: MouseEvent) => {
                mouseEventListener.handler = endGripHandler;
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
            tooltip: createTooltip(),
        };
    });

    context.subscribe(() => {
        vm.state = {
            innerDivStyles: createInnerDivStyles(),
        };
    });

    return vm;
}
