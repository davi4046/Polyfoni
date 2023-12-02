import type { TrackVMGroup } from "../../../aliases";

class TimelineVM {
    constructor(
        private _top: TrackVMGroup[],
        private _center: TrackVMGroup[],
        private _bottom: TrackVMGroup[]
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
}

export default TimelineVM;
