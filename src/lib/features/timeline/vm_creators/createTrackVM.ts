import type TimelineContext from "../contexts/TimelineContext";
import type Track from "../models/track/Track";
import TrackVM from "../view_models/track/TrackVM";
import TrackVMState from "../view_models/track/TrackVMState";
import createItemVM from "./createItemVM";

function createTrackVM(model: Track, context: TimelineContext): TrackVM {
    const update = (model: Track): TrackVMState => {
        return new TrackVMState(
            model.label,
            model.items.map((item) => {
                return createItemVM(item, context);
            })
        );
    };

    return new TrackVM(model, update);
}

export default createTrackVM;
