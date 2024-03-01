import Model from "../../../architecture/Model";
import type { ParentChildState } from "../../../shared/architecture/state-hierarchy-utils";

import type Section from "./Section";
import type Track from "./Track";

interface VoiceState extends ParentChildState<Section, Track<any>> {}

class Voice extends Model<VoiceState> {}

export default Voice;
