import Model from "../../../shared/architecture/model/Model";
import type { ParentChildState } from "../../../shared/architecture/state/state_utils";

import type Section from "./Section";
import type Track from "./Track";

interface VoiceState extends ParentChildState<Section, Track<any>> {}

class Voice extends Model<VoiceState> {}

export default Voice;
