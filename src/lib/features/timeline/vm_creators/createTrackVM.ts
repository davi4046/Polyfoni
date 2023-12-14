import TrackVM from "../view_models/track/TrackVM";
import { createTrackVMState } from "../view_models/track/TrackVMState";
import createGhostVM from "./createGhostVM";
import createItemVM from "./createItemVM";

import type TimelineContext from "../contexts/TimelineContext";
import type Track from "../models/track/Track";

function createTrackVM(model: Track, context: TimelineContext): TrackVM {
    const update = (model: Track) => {
        const items = model.state.items.map((item) => {
            return createItemVM(item, context);
        });

        const ghostItems = context.move.ghostItems
            .filter((item) => item.state.parent === model)
            .map((item) => createGhostVM(item, context));

        return createTrackVMState({
            label: model.state.label,
            items: [...items, ...ghostItems],
        });
    };

    return new TrackVM(model, update);
}

export default createTrackVM;
