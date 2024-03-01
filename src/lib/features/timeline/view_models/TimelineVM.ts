import type VoiceVM from "./VoiceVM";
import Model from "../../../shared/architecture/model/Model";

interface TimelineVMState {
    readonly top?: VoiceVM[];
    readonly center?: VoiceVM[];
    readonly bottom?: VoiceVM[];
    readonly handleMouseMove_tracks?: (event: MouseEvent) => void;
    readonly handleMouseMove_others?: (event: MouseEvent) => void;
}

class TimelineVM extends Model<Required<TimelineVMState>> {}

export default TimelineVM;
