import chroma from "chroma-js";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import { type ItemTypes, itemTextFunctions } from "../utils/ItemTypes";
import ItemVM from "../view_models/ItemVM";

export default function createItemVM_ghost<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const vm = new ItemVM(
        {
            start: model.state.start,
            end: model.state.end,
            text: itemTextFunctions[model.itemType](model.state.content),

            innerDivStyles: {
                "background-color": chroma.hcl(0, 0, 80).css(),
                opacity: "0.75",
                "border-width": "2px",
                "border-color": "black",
                inset: "4px 0 4px 0",
                padding: "0 8px 0 8px",
            },
            handleStyles: {
                "background-color": "black",
                opacity: "0.25",
            },
        },
        model.id
    );

    model.subscribe(() => {
        vm.state = {
            start: model.state.start,
            end: model.state.end,
            text: itemTextFunctions[model.itemType](model.state.content),
        };
    });

    return vm;
}
