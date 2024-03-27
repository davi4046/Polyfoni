import type Track from "../track/Track";
import Model from '../../../architecture/Model';
import * as stateHierarchyUtils from '../../../architecture/state-hierarchy-utils';

import { itemInitFunctions, type ItemTypes } from './ItemTypes';

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
