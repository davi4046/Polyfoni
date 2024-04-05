import type { ItemTypes } from "../item/ItemTypes";
import type Track from "../track/Track";
import Stateful from "../../../architecture/Stateful";
import type { ChildState } from "../../../architecture/state-hierarchy-utils";

export interface HighlightState<T extends keyof ItemTypes>
    extends ChildState<Track<T>> {
    start: number;
    end: number;
}

export default class Highlight<T extends keyof ItemTypes> extends Stateful<
    HighlightState<T>
> {}
