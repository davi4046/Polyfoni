import chroma from "chroma-js";

import { itemColorFunctions, itemTextFunctions } from "../item-type-config";
import type TimelineContext from "../context/TimelineContext";
import ItemVM from "../view_models/ItemVM";
import type Item from "../../models/item/Item";
import { type ItemTypes } from "../../models/item/ItemTypes";

export default function createItemVM_ghost<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const baseInnerDivStyles: Record<string, string> = {
        "border-width": "2px",
        "border-color": "black",
        inset: "4px 0 4px 0",
        padding: "0 8px 0 8px",
        opacity: "0.75",
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

        return innerDivStyles;
    }

    const vm = new ItemVM({
        start: model.state.start,
        end: model.state.end,
        text: itemTextFunctions[model.itemType](model.state.content),
        innerDivStyles: createInnerDivStyles(),
    });

    model.subscribe(() => {
        vm.state = {
            start: model.state.start,
            end: model.state.end,
            text: itemTextFunctions[model.itemType](model.state.content),
            innerDivStyles: createInnerDivStyles(),
        };
    });

    return vm;
}
