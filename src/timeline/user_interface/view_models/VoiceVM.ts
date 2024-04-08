import Stateful from "../../../architecture/Stateful";

import type TrackGroupVM from "./TrackGroupVM";

interface VoiceVMState {
    trackGroups: TrackGroupVM[];
}

export default class VoiceVM extends Stateful<VoiceVMState> {}
