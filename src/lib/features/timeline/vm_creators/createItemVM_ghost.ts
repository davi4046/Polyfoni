import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";

import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/item/Item";

function createItemVM_ghost<TModel extends Item<any>>(
    model: TModel,
    context: TimelineContext
): ItemVM {
    const update = (model: TModel) => {
        return createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: model.state.content,
            opacity: 0.75,
        });
    };

    return new ItemVM(model, update);
}

export default createItemVM_ghost;
