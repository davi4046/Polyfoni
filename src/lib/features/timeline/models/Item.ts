import { postInitFunctions, type ItemTypes } from "./../utils/ItemTypes";
import Model from "../../../architecture/Model";
import * as stateHierarchyUtils from "../../../architecture/state-hierarchy-utils";

import type Track from "./Track";

interface ItemState<T extends keyof ItemTypes>
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

        if (postInitFunctions[itemType]) postInitFunctions[itemType]!(this);
    }
}
