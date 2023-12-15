import chroma from "chroma-js";

import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

interface ItemVMState {
    readonly start: number;
    readonly end: number;
    readonly text: string;
    readonly backgroundColor?: chroma.Color;
    readonly outlineColor?: chroma.Color;
    readonly opacity?: number;
    readonly handleMouseDown?: (event: MouseEvent) => void;
    readonly handleMount?: () => void;
}

const defaults = {
    backgroundColor: chroma.hcl(0, 0, 80),
    outlineColor: chroma.rgb(0, 0, 0, 0),
    opacity: 1,
    handleMouseDown: () => {},
    handleMount: () => {},
};

function createItemVMState(options: ItemVMState) {
    return createWithDefaults(options, defaults);
}

export { type ItemVMState, createItemVMState };
