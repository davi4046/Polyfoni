import type TrackVM from "../track/TrackVM";

class TimelineVMState {
    constructor(
        readonly top: TrackVM[][],
        readonly center: TrackVM[][],
        readonly bottom: TrackVM[][],
        readonly handleMouseDown: (event: MouseEvent) => void,
        readonly handleMouseUp: (event: MouseEvent) => void,
        readonly handleMouseMove: (event: MouseEvent) => void
    ) {}
}

export default TimelineVMState;
