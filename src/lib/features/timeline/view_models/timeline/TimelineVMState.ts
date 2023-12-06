import createVMState from "../../../../shared/utils/create_vm_state/createVMState";

import type TrackVM from "../track/TrackVM";

interface TimelineVMState {
    readonly top?: TrackVM[][];
    readonly center?: TrackVM[][];
    readonly bottom?: TrackVM[][];
    readonly handleMouseDown?: (event: MouseEvent) => void;
    readonly handleMouseUp?: (event: MouseEvent) => void;
    readonly handleMouseMove?: (event: MouseEvent) => void;
}

const defaults = {
    top: [],
    center: [],
    bottom: [],
    handleMouseDown: () => {},
    handleMouseUp: () => {},
    handleMouseMove: () => {},
};

function createTimelineVMState(options: TimelineVMState) {
    return createVMState(options, defaults);
}

export { type TimelineVMState, createTimelineVMState };
