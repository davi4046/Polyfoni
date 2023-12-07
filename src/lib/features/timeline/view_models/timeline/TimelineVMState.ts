import createWithDefaults from '../../../../shared/utils/create_with_defaults/createWithDefaults';

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
    return createWithDefaults(options, defaults);
}

export { type TimelineVMState, createTimelineVMState };
