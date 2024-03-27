import Model from "../../lib/architecture/Model";

import type TrackVM from "./TrackVM";

interface VoiceVMState {
    tracks: TrackVM[];
    isCollapsed: boolean;
}

export default class VoiceVM extends Model<VoiceVMState> {}
