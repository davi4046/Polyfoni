import Model from "../../../shared/architecture/model/Model";

import type TrackVM from "./TrackVM";

interface VoiceVMState {
    readonly tracks: TrackVM[];
    readonly isCollapsed?: boolean;
}

class VoiceVM extends Model<Required<VoiceVMState>> {}

export default VoiceVM;
