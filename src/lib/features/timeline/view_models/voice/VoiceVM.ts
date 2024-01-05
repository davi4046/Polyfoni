import BoundModel from "../../../../shared/architecture/bound_model/BoundModel";

import type Voice from "../../models/voice/Voice";
import type { VoiceVMState_bound } from "./VoiceVMState_bound";
import type { VoiceVMState_unbound } from "./VoiceVMState_unbound";

class VoiceVM extends BoundModel<
    Voice,
    Required<VoiceVMState_bound>,
    Required<VoiceVMState_unbound>
> {}

export default VoiceVM;
