import createBoundModel from "../../../shared/architecture/model/createBoundModel";
import { toStringFunctions } from "../models/_shared/item_types/toStringFunctions";
import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/item/Item";
import type ItemTypes from "../models/_shared/item_types/ItemTypes";

function createItemVM_ghost<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    return createBoundModel(ItemVM, model, () => {
        return createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: toStringFunctions[model.itemType](model.state.content),
            opacity: 0.75,
        });
    });
}

export default createItemVM_ghost;
