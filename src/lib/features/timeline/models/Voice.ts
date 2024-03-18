import Model from "../../../architecture/Model";
import type {
    ChildState,
    ParentState,
} from "../../../architecture/state-hierarchy-utils";

import type Section from "./Section";
import type Track from "./Track";

export interface VoiceState
    extends ChildState<Section>,
        ParentState<Track<any>> {}

export default class Voice extends Model<VoiceState> {}
