import Stateful from "../../../architecture/Stateful";

import type TrackVM from "./TrackVM";

interface VoiceVMState {
    tracks: TrackVM[];
    isCollapsed: boolean;
}

export default class VoiceVM extends Stateful<VoiceVMState> {}
