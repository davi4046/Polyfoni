import type Track from "../track/Track";
import Model from "../../../architecture/Model";
import type { ChildState } from "../../../architecture/state-hierarchy-utils";

export interface HighlightState extends ChildState<Track<any>> {
    start: number;
    end: number;
}

export default class Highlight extends Model<HighlightState> {}
