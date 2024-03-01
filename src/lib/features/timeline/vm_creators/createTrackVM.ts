import type TimelineContext from "../context/TimelineContext";
import type { ItemTypes } from "../utils/ItemTypes";
import type Track from "../models/track/Track";
import TrackVM from "../view_models/track/TrackVM";
import { createTrackVMState } from "../view_models/track/TrackVMState";

import createItemVM from "./createItemVM";
import createItemVM_ghost from "./createItemVM_ghost";

function createTrackVM<T extends keyof ItemTypes>(
    model: Track<T>,
    context: TimelineContext
): TrackVM {
    const createItems = () => {
        const items = model.state.children.map((item) => {
            return createItemVM(item, context);
        });

        const ghostItems = context.moveManager.ghostItems
            .filter((item) => item.state.parent === model)
            .map((item) => createItemVM_ghost(item, context));

        return [...items, ...ghostItems];
    };

    const vm = new TrackVM(
        createTrackVMState({
            label: model.state.label,
            items: createItems(),
        }),
        model.id
    );

    model.subscribe(() => {
        vm.state = {
            label: model.state.label,
            items: createItems(),
        };
    });

    context.moveManager.subscribe(() => {
        vm.state = {
            items: createItems(),
        };
    });

    return vm;
}

export default createTrackVM;
