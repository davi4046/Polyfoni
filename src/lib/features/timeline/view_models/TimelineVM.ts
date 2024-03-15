import type Item from "../models/Item";
import Model from "../../../architecture/Model";

import type VoiceVM from "./VoiceVM";

interface TimelineVMState {
    top: VoiceVM[];
    center: VoiceVM[];
    bottom: VoiceVM[];
    handleMouseMove_tracks: (event: MouseEvent) => void;
    handleMouseMove_others: (event: MouseEvent) => void;
}

class TimelineVM extends Model<TimelineVMState> {}

export default TimelineVM;
