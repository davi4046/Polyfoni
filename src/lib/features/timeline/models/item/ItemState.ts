import type Track from "../track/Track";
import type { ItemTypes } from "../../utils/ItemTypes";
import type ChildState from "../../../../shared/architecture/state/ChildState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

interface ItemState<T extends keyof ItemTypes> extends ChildState<Track<T>> {
    readonly start: number;
    readonly end: number;
    readonly content?: ItemTypes[T] | null;
}

const defaults = {
    content: null,
};

function createItemState<T extends keyof ItemTypes>(options: ItemState<T>) {
    return createWithDefaults(options, defaults);
}

export { type ItemState, createItemState };
