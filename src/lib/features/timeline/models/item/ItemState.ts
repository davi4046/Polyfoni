import type ChildState from "../../../../shared/state/ChildState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Track from "../track/Track";

interface ItemState extends ChildState<Track> {
    readonly start: number;
    readonly end: number;
    readonly content: string;
}

function createItemState(options: ItemState) {
    return createWithDefaults(options, {});
}

export { type ItemState, createItemState };
