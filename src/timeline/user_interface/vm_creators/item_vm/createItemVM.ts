import chroma from "chroma-js";

import {
    itemColorFunctions,
    itemTextFunctions,
    itemTooltipContentFunctions,
} from "../../item-type-config";
import type TimelineContext from "../../context/TimelineContext";
import EndGripHandler from "../../event_handlers/EndGripHandler";
import ItemHandler from "../../event_handlers/ItemHandler";
import StartGripHandler from "../../event_handlers/StartGripHandler";
import ItemVM from "../../view_models/ItemVM";
import { globalEventListener } from "../../../../architecture/GlobalEventListener";
import type Item from "../../../models/item/Item";
import { type ItemTypes } from "../../../models/item/ItemTypes";

export default function createItemVM<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const itemHandler = new ItemHandler(context, model);
    const startGripHandler = new StartGripHandler(context, model);
    const endGripHandler = new EndGripHandler(context, model);

    const colorFunction = itemColorFunctions[model.itemType];
    const tooltipContentFunction = itemTooltipContentFunctions[model.itemType];

    const baseInnerDivStyles: Record<string, string> = {
        "border-width": "2px",
        "border-color": "black",
        inset: "4px 0 4px 0",
        padding: "0 8px 0 8px",
    };

    const gripStylesUnselected = {
        "background-color": "black",
        opacity: "0.25",
    };

    const gripStylesSelected = {
        "background-color": "white",
        opacity: "0.75",
    };

    function compileStart() {
        const startOverride = context.state.visualStartOverrideMap.get(model);
        return {
            start:
                startOverride !== undefined ? startOverride : model.state.start,
        };
    }

    function compileEnd() {
        const endOverride = context.state.visualEndOverrideMap.get(model);
        return {
            end: endOverride !== undefined ? endOverride : model.state.end,
        };
    }

    function compileText() {
        return {
            text: itemTextFunctions[model.itemType](model.state.content),
        };
    }

    function compileInnerDivStyles() {
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

        return { innerDivStyles: innerDivStyles };
    }

    function compileOuterDivStyles() {
        return {
            outerDivStyles:
                context.state.visualStartOverrideMap.has(model) ||
                context.state.visualEndOverrideMap.has(model)
                    ? { "z-index": "30" }
                    : { "z-index": "20" },
        };
    }

    function compileStartGripStyles() {
        return {
            startGripStyles: context.state.visualStartOverrideMap.has(model)
                ? gripStylesSelected
                : gripStylesUnselected,
        };
    }

    function compileEndGripStyles() {
        return {
            endGripStyles: context.state.visualEndOverrideMap.has(model)
                ? gripStylesSelected
                : gripStylesUnselected,
        };
    }

    function compileTooltip() {
        let content = "";

        if (tooltipContentFunction) {
            content += tooltipContentFunction(model.state.content);
        }

        if (model.state.error) {
            content += `
                <div style="color: pink">Error: ${model.state.error}</div>
            `;
        }

        const tooltip = {
            content: content,
            allowHTML: true,
            theme: "default",
        };

        return {
            tooltip: content === "" ? undefined : tooltip,
        };
    }

    const vm = new ItemVM({
        ...compileStart(),
        ...compileEnd(),
        ...compileText(),
        ...compileInnerDivStyles(),
        ...compileOuterDivStyles(),
        ...compileStartGripStyles(),
        ...compileEndGripStyles(),
        ...compileTooltip(),

        handleMouseMove: (event: MouseEvent) => {
            globalEventListener.handler = itemHandler;
            event.stopPropagation();
        },
        handleMouseMove_startGrip: (event: MouseEvent) => {
            globalEventListener.handler = startGripHandler;
            event.stopPropagation();
        },
        handleMouseMove_endGrip: (event: MouseEvent) => {
            globalEventListener.handler = endGripHandler;
            event.stopPropagation();
        },
        onDestroy: () => {
            globalEventListener.handler = undefined;
        },
    });

    model.subscribe((oldState) => {
        vm.state = {
            ...(model.state.start !== oldState.start ? compileStart() : {}),
            ...(model.state.end !== oldState.end ? compileEnd() : {}),
            ...(model.state.content !== oldState.content ? compileText() : {}),
            ...(model.state.content !== oldState.content ||
            model.state.error !== oldState.error
                ? { ...compileInnerDivStyles(), ...compileTooltip() }
                : {}),
        };
    });

    context.subscribe((oldState) => {
        const hasStartOverrideChanged =
            context.state.visualStartOverrideMap.get(model) !==
            oldState.visualStartOverrideMap.get(model);

        const hasEndOverrideChanged =
            context.state.visualEndOverrideMap.get(model) !==
            oldState.visualEndOverrideMap.get(model);

        vm.state = {
            ...(hasStartOverrideChanged
                ? { ...compileStart(), ...compileStartGripStyles() }
                : {}),

            ...(hasEndOverrideChanged
                ? { ...compileEnd(), ...compileEndGripStyles() }
                : {}),

            ...(context.state.selectedItems.includes(model) !==
            oldState.selectedItems.includes(model)
                ? compileInnerDivStyles()
                : {}),

            ...(hasStartOverrideChanged || hasEndOverrideChanged
                ? compileOuterDivStyles()
                : {}),
        };
    });

    return vm;
}
