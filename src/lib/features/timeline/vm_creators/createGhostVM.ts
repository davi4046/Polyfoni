import chroma from "chroma-js";

import ItemVM from "../view_models/item/ItemVM";
import ItemVMState from "../view_models/item/ItemVMState";

import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";

function createGhostVM(model: Item, context: TimelineContext): ItemVM {
    const update = (model: Item): ItemVMState => {
        return new ItemVMState(
            model.start,
            model.end,
            model.content,
            chroma.hcl(0, 0, 80),
            chroma.hcl(0, 0, 0, 0),
            0.75,
            () => {}
        );
    };

    return new ItemVM(model, update);
}

export default createGhostVM;
