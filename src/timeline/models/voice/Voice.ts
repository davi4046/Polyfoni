import type Section from "../section/Section";
import type Track from "../track/Track";
import Stateful from "../../../architecture/Stateful";
import type {
    ChildState,
    ParentState,
} from "../../../architecture/state-hierarchy-utils";

export interface VoiceState
    extends ChildState<Section>,
        ParentState<Track<any>> {}

export default class Voice extends Stateful<VoiceState> {}
