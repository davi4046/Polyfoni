import type TrackGroup from "../track_group/TrackGroup";
import type VoiceGroup from "../voice_group/VoiceGroup";
import Stateful from "../../../architecture/Stateful";
import type {
    ChildState,
    ParentState,
} from "../../../architecture/state-hierarchy-utils";

export interface VoiceState
    extends ChildState<VoiceGroup>,
        ParentState<TrackGroup> {
    label: string;
}

export default class Voice extends Stateful<VoiceState> {}
