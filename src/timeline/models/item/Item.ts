import type Track from "../track/Track";
import Stateful from "../../../architecture/Stateful";
import * as stateHierarchyUtils from "../../../architecture/state-hierarchy-utils";

import { type ItemTypes } from "./ItemTypes";

export interface ItemState<T extends keyof ItemTypes>
    extends stateHierarchyUtils.ChildState<Track<T>> {
    start: number;
    end: number;
    content: ItemTypes[T];
    error?: string;
}

export default class Item<T extends keyof ItemTypes> extends Stateful<
    ItemState<T>
> {
    constructor(
        readonly itemType: T,
        state: ItemState<T>
    ) {
        super(state);
    }
}
