import chroma from "chroma-js";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import { type ItemTypes, stringConversionFunctions } from "../utils/ItemTypes";
import ItemVM from "../view_models/ItemVM";

export default function createItemVM_ghost<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const vm = new ItemVM(
        {
            start: model.state.start,
            end: model.state.end,
            text: stringConversionFunctions[model.itemType](
                model.state.content
            ),

            opacity: 0.75,
            bgColor: chroma.hcl(0, 0, 80),
            olColor: chroma.hcl(0, 0, 0, 0),

            handleMouseMove: () => {},
            handleMouseMove_endHandle: () => {},
            handleMouseMove_startHandle: () => {},
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

    return vm;
}
