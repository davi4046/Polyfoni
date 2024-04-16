import Item from "../item/Item";
import type { ItemTypes } from "../item/ItemTypes";
import type TrackGroup from "../track_group/TrackGroup";
import Stateful from "../../../architecture/Stateful";
import {
    getPosition,
    validatePositionPattern,
    type ChildState,
    type ParentState,
} from "../../../architecture/state-hierarchy-utils";

export interface TrackState<T extends keyof ItemTypes>
    extends ChildState<TrackGroup>,
        ParentState<Item<T>> {}

export default class Track<T extends keyof ItemTypes> extends Stateful<
    TrackState<T>
> {
    constructor(
        readonly itemType: T,
        state: TrackState<T>
    ) {
        super(state);
    }

    isUserEditable(): boolean {
        const position = getPosition(this);
        return !["1,*,0,0", "2,0,0,0"].some((pattern) =>
            validatePositionPattern(position, pattern)
        );
    }
}
