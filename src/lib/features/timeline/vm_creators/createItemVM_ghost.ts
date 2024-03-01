import type TimelineContext from "../context/TimelineContext";
import { type ItemTypes, stringConversionFunctions } from "../utils/ItemTypes";
import type Item from "../models/item/Item";
import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";

function createItemVM_ghost<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const vm = new ItemVM(
        createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: stringConversionFunctions[model.itemType](
                model.state.content
            ),
            opacity: 0.75,
        })
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

export default createItemVM_ghost;
