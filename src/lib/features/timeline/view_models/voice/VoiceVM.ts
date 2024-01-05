import BoundModel from "../../../../shared/architecture/bound_model/BoundModel";

import type Voice from "../../models/voice/Voice";
import type { VoiceVMState } from "./VoiceVMState";

class VoiceVM extends BoundModel<Voice, Required<VoiceVMState>, {}> {}

export default VoiceVM;
