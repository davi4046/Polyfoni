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
    role: TrackGroupRole;
}

export type TrackGroupRole =
    | "timeline_settings"
    | "timeline_analysis"
    | "voice_output"
    | "voice_framework"
    | "voice_decoration";

export default class TrackGroup extends Stateful<TrackGroupState> {}
