import type Section from "../section/Section";
import type Track from "../track/Track";
import Model from "../../../architecture/Model";
import type {
    ChildState,
    ParentState,
} from "../../../architecture/state-hierarchy-utils";

export interface VoiceState
    extends ChildState<Section>,
        ParentState<Track<any>> {}

export default class Voice extends Model<VoiceState> {}
