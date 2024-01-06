import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type VoiceVM from "../voice/VoiceVM";

interface TimelineVMState {
    readonly top?: VoiceVM[];
    readonly center?: VoiceVM[];
    readonly bottom?: VoiceVM[];
    readonly handleMouseMove_tracks?: (event: MouseEvent) => void;
    readonly handleMouseMove_others?: (event: MouseEvent) => void;
}

const defaults = {
    top: [],
    center: [],
    bottom: [],
    handleMouseMove_tracks: () => {},
    handleMouseMove_others: () => {},
};

function createTimelineVMState(options: TimelineVMState) {
    return createWithDefaults(options, defaults);
}

export { type TimelineVMState, createTimelineVMState };
