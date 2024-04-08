import type Track from "../track/Track";
import type Voice from "../voice/Voice";
import Stateful from "../../../architecture/Stateful";
import type {
    ChildState,
    ParentState,
} from "../../../architecture/state-hierarchy-utils";

export interface TrackGroupState
    extends ChildState<Voice>,
        ParentState<Track<any>> {
    label?: string;
}

export default class TrackGroup extends Stateful<TrackGroupState> {}
