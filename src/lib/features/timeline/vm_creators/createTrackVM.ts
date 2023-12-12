import TrackVM from "../view_models/track/TrackVM";
import { createTrackVMState } from "../view_models/track/TrackVMState";
import createItemVM from "./createItemVM";

import type TimelineContext from "../contexts/TimelineContext";
import type Track from "../models/track/Track";

function createTrackVM(model: Track, context: TimelineContext): TrackVM {
    const update = (model: Track) => {
        const items = model.state.items.map((item) => {
            return createItemVM(item, context);
        });

        return createTrackVMState({
            label: model.state.label,
            items: items,
        });
    };

    return new TrackVM(model, update);
}

export default createTrackVM;
