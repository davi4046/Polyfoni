import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

interface HighlightVMState {
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
}

function createHighlightVMState(options: HighlightVMState) {
    return createWithDefaults(options, {});
}

export { type HighlightVMState, createHighlightVMState };
