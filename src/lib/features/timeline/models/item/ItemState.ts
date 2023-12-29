import type ChildState from "../../../../shared/architecture/state/ChildState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Track from "../track/Track";
import type Item from "./Item";

interface ItemState<TContent> extends ChildState<Track<Item<TContent>>> {
    readonly start: number;
    readonly end: number;
    readonly content?: TContent | null;
}

const defaults = {
    content: null,
};

function createItemState<TContent>(options: ItemState<TContent>) {
    return createWithDefaults(options, defaults);
}

export { type ItemState, createItemState };
