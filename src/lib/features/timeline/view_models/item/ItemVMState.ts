import chroma from "chroma-js";

import createVMState from "../../../../shared/utils/create_vm_state/createVMState";

interface ItemVMState {
    readonly start: number;
    readonly end: number;
    readonly text: string;
    readonly backgroundColor?: chroma.Color;
    readonly outlineColor?: chroma.Color;
    readonly opacity?: number;
    readonly handleMouseDown?: (event: MouseEvent) => void;
}

const defaults = {
    backgroundColor: chroma.hcl(0, 0, 80),
    outlineColor: chroma.rgb(0, 0, 0, 0),
    opacity: 1,
    handleMouseDown: () => {},
};

function createItemVMState(options: ItemVMState) {
    return createVMState(options, defaults);
}

export { type ItemVMState, createItemVMState };
