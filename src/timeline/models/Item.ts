import { itemInitFunctions, type ItemTypes } from "./../utils/ItemTypes";
import Model from "../../lib/architecture/Model";
import * as stateHierarchyUtils from "../../lib/architecture/state-hierarchy-utils";

import type Track from "./Track";

export interface ItemState<T extends keyof ItemTypes>
    extends stateHierarchyUtils.ChildState<Track<T>> {
    start: number;
    end: number;
    content: ItemTypes[T];
}

export default class Item<T extends keyof ItemTypes> extends Model<
    ItemState<T>
> {
    constructor(
        readonly itemType: T,
        state: ItemState<T>
    ) {
        super(state);

        if (itemInitFunctions[itemType]) itemInitFunctions[itemType]!(this);
    }
}
