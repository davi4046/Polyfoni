import ItemVM from "../view_models/item/ItemVM";
import { createItemVMState } from "../view_models/item/ItemVMState";

import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";

function createGhostVM(model: Item, context: TimelineContext): ItemVM {
    const update = (model: Item) => {
        return createItemVMState({
            start: model.state.start,
            end: model.state.end,
            text: model.state.content,
            opacity: 0.75,
        });
    };

    return new ItemVM(model, update);
}

export default createGhostVM;
