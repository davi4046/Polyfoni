import Model from "../../../shared/architecture/model/Model";
import type ParentChildState from "../../../shared/architecture/state/ParentChildState";

import type Section from "./Section";
import type Track from "./Track";

interface VoiceState extends ParentChildState<Section, Track<any>> {}

class Voice extends Model<Required<VoiceState>> {}

export default Voice;
