import type { ItemTypes } from "../item/ItemTypes";
import type Track from "../track/Track";
import Model from "../../../architecture/Model";
import type { ChildState } from "../../../architecture/state-hierarchy-utils";

export interface HighlightState<T extends keyof ItemTypes>
    extends ChildState<Track<T>> {
    start: number;
    end: number;
}

export default class Highlight<T extends keyof ItemTypes> extends Model<
    HighlightState<T>
> {}
