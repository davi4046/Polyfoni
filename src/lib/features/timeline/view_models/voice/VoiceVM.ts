import type TrackVM from "../track/TrackVM";
import Model from "../../../../shared/architecture/model/Model";

interface VoiceVMState {
    readonly tracks: TrackVM[];
    readonly isCollapsed?: boolean;
}

class VoiceVM extends Model<Required<VoiceVMState>> {}

export default VoiceVM;
