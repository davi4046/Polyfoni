import Model from "../../../../shared/architecture/model/Model";

import type ItemTypes from "../_shared/item_types/ItemTypes";

import type { TrackState } from "./TrackState";

class Track<T extends keyof ItemTypes> extends Model<TrackState<T>> {
    constructor(
        readonly itemType: T,
        state: Required<TrackState<T>>
    ) {
        super(state);
    }
}

export default Track;
