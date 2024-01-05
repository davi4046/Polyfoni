import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

interface VoiceVMState_unbound {
    readonly isCollapsed?: boolean;
}

const defaults = {
    isCollapsed: false,
};

function createVoiceVMState_unbound(options: VoiceVMState_unbound) {
    return createWithDefaults(options, defaults);
}

export { type VoiceVMState_unbound, createVoiceVMState_unbound };
