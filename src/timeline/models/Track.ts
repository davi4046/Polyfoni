import type { ItemTypes } from "../utils/ItemTypes";
import Model from "../../lib/architecture/Model";
import * as stateHierarchyUtils from "../../lib/architecture/state-hierarchy-utils";

import Item from "./Item";
import type Voice from "./Voice";

export interface TrackState<T extends keyof ItemTypes>
    extends stateHierarchyUtils.ChildState<Voice>,
        stateHierarchyUtils.ParentState<Item<T>> {
    label: string;
    allowUserEdit: boolean;
}

export default class Track<T extends keyof ItemTypes> extends Model<
    TrackState<T>
> {
    constructor(
        readonly itemType: T,
        state: TrackState<T>
    ) {
        super(state);
    }
}
