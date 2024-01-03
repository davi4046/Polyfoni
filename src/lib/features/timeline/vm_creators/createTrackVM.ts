import TrackVM from "../view_models/track/TrackVM";
import { createTrackVMState } from "../view_models/track/TrackVMState";
import createItemVM from "./createItemVM";
import createItemVM_ghost from "./createItemVM_ghost";

import type TimelineContext from "../context/TimelineContext";
import type Track from "../models/track/Track";
import type ItemTypes from "../models/_shared/ItemTypes";

function createTrackVM<T extends keyof ItemTypes>(
    model: Track<T>,
    context: TimelineContext
): TrackVM {
    const update = (model: Track<T>) => {
        const items = model.state.children.map((item) => {
            return createItemVM(item, context);
        });

        const ghostItems = context.moveManager.ghostItems
            .filter((item) => item.state.parent === model)
            .map((item) => createItemVM_ghost(item, context));

        return createTrackVMState({
            label: model.state.label,
            items: [...items, ...ghostItems],
        });
    };

    return new TrackVM(model, update);
}

export default createTrackVM;
