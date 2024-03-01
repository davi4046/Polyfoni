import type Track from "../track/Track";
import type { ItemTypes } from "../../utils/ItemTypes";
import type ChildState from "../../../../shared/architecture/state/ChildState";

interface ItemState<T extends keyof ItemTypes> extends ChildState<Track<T>> {
    readonly start: number;
    readonly end: number;
    readonly content?: ItemTypes[T] | null;
}

export type { ItemState as default };
