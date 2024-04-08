import Stateful from "../../../architecture/Stateful";

import type TrackGroupVM from "./TrackGroupVM";

interface VoiceVMState {
    trackGroups: TrackGroupVM[];
    isCollapsed: boolean;
}

export default class VoiceVM extends Stateful<VoiceVMState> {}
