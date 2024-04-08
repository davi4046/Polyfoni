import type Section from "../section/Section";
import type TrackGroup from "../track_group/TrackGroup";
import Stateful from "../../../architecture/Stateful";
import type {
    ChildState,
    ParentState,
} from "../../../architecture/state-hierarchy-utils";

export interface VoiceState
    extends ChildState<Section>,
        ParentState<TrackGroup> {}

export default class Voice extends Stateful<VoiceState> {}
