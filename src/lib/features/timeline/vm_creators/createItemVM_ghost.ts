import { toStringFunctions } from "../models/_shared/toStringFunctions";
import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/item/Item";
import type ItemTypes from "../models/_shared/ItemTypes";

function createItemVM_ghost<T extends keyof ItemTypes>(
    model: Item<T>,
    context: TimelineContext
): ItemVM {
    const update = (model: Item<T>) => {
        const createText = toStringFunctions[model.itemType];

        return createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: createText(model.state.content),
            opacity: 0.75,
        });
    };

    return new ItemVM(model, update);
}

export default createItemVM_ghost;
