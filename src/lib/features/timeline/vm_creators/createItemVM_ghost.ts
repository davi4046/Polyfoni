import type TimelineContext from "../context/TimelineContext";
import { type ItemTypes, stringConversionFunctions } from "../utils/ItemTypes";
import type Item from "../models/item/Item";
import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";
import createBoundModel from "../../../shared/architecture/model/createBoundModel";

function createItemVM_ghost<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    return createBoundModel(ItemVM, model, () => {
        return createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: stringConversionFunctions[model.itemType](
                model.state.content
            ),
            opacity: 0.75,
        });
    });
}

export default createItemVM_ghost;
