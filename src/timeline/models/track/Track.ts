import Item from "../item/Item";
import type { ItemTypes } from "../item/ItemTypes";
import type Voice from "../voice/Voice";
import Stateful from "../../../architecture/Stateful";
import * as stateHierarchyUtils from "../../../architecture/state-hierarchy-utils";

export interface TrackState<T extends keyof ItemTypes>
    extends stateHierarchyUtils.ChildState<Voice>,
        stateHierarchyUtils.ParentState<Item<T>> {
    label: string;
    allowUserEdit: boolean;
}

export default class Track<T extends keyof ItemTypes> extends Stateful<
    TrackState<T>
> {
    constructor(
        readonly itemType: T,
        state: TrackState<T>
    ) {
        super(state);
    }
}
