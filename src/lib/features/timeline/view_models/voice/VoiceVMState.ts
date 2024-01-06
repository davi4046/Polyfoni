import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type TrackVM from "../track/TrackVM";

interface VoiceVMState {
    readonly tracks: TrackVM[];
    readonly isCollapsed?: boolean;
}

const defaults = {
    isCollapsed: false,
};

function createVoiceVMState(options: VoiceVMState) {
    return createWithDefaults(options, defaults);
}

export { type VoiceVMState, createVoiceVMState };
