import type TrackVM from "../track/TrackVM";

class TimelineVMState {
    constructor(
        private _top: TrackVM[][],
        private _center: TrackVM[][],
        private _bottom: TrackVM[][],
        private _handleMouseDown: (event: MouseEvent) => void
    ) {}

    get top() {
        return this._top;
    }

    get center() {
        return this._center;
    }

    get bottom() {
        return this._bottom;
    }

    get handleMouseDown() {
        return this._handleMouseDown;
    }
}

export default TimelineVMState;
