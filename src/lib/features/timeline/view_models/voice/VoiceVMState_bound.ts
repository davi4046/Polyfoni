import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type TrackVM from "../track/TrackVM";

interface VoiceVMState_bound {
    readonly tracks: TrackVM[];
}

function createVoiceVMState_bound(options: VoiceVMState_bound) {
    return createWithDefaults(options, {});
}

export { type VoiceVMState_bound, createVoiceVMState_bound };
