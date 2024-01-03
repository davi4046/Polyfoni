import type Model from "../../../../shared/architecture/model/Model";
import type ChildState from "../../../../shared/architecture/state/ChildState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type ItemTypes from "../_shared/ItemTypes";

import type Track from "../track/Track";
import type { TrackState } from "../track/TrackState";

interface ItemState<T extends keyof ItemTypes>
    extends ChildState<Model<TrackState<T>>> {
    readonly start: number;
    readonly end: number;
    readonly content?: ItemTypes[T]["ContentType"] | null;
}

const defaults = {
    content: null,
};

function createItemState<T extends keyof ItemTypes>(options: ItemState<T>) {
    return createWithDefaults(options, defaults);
}

export { type ItemState, createItemState };
