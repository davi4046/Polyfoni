import Model from "../../../architecture/Model";

import type TrackVM from "./TrackVM";

interface VoiceVMState {
    tracks: TrackVM<any>[];
    isCollapsed: boolean;
}

class VoiceVM extends Model<VoiceVMState> {}

export default VoiceVM;
