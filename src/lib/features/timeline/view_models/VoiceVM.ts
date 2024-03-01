import Model from "../../../shared/architecture/model/Model";

import type TrackVM from "./TrackVM";

interface VoiceVMState {
    tracks: TrackVM[];
    isCollapsed: boolean;
}

class VoiceVM extends Model<VoiceVMState> {}

export default VoiceVM;