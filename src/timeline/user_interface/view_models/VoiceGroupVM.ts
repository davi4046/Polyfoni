import Stateful from "../../../architecture/Stateful";

import type VoiceVM from "./VoiceVM";

interface VoiceGroupVMState {
    voices: VoiceVM[];
}

export default class VoiceGroupVM extends Stateful<VoiceGroupVMState> {}
