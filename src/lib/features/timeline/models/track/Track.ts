import Model from "../../../../shared/architecture/model/Model";

import type ItemTypes from "../_shared/ItemTypes";

import type { TrackState } from "./TrackState";

class Track<T extends keyof ItemTypes> extends Model<Track<T>, TrackState<T>> {
    constructor(
        readonly itemType: T,
        createState: (model: Track<T>) => Required<TrackState<T>>
    ) {
        super(createState);
    }
}

export default Track;
