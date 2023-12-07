import type ItemVM from "../view_models/item/ItemVM";
import ViewModel from '../../../shared/view_model/ViewModel';
import { createItemVMState } from '../view_models/item/ItemVMState';

import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";

function createGhostVM(model: Item, context: TimelineContext): ItemVM {
    const update = (model: Item) => {
        return createItemVMState({
            start: model.start,
            end: model.end,
            text: model.content,
            opacity: 0.75,
        });
    };

    return ViewModel.create(model, update);
}

export default createGhostVM;
