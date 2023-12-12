import Subscribable from "../../../shared/subscribable/Subscribable";

import type Track from "../models/track/Track";

class CursorContext {
    readonly subscribable = new Subscribable(this);

    private _hoveredBeat: number | null = null;
    private _hoveredTrack: Track | null = null;
    private _clickedBeat: number | null = null;
    private _clickedTrack: Track | null = null;

    readonly reportMouseDown = () => {
        this._clickedBeat = this._hoveredBeat;
        this._clickedTrack = this._hoveredTrack;
        this.subscribable.notifySubscribers();
    };

    readonly reportMouseUp = () => {
        this._clickedBeat = null;
        this._hoveredBeat = null;
        this.subscribable.notifySubscribers();
    };

    set hoveredBeat(newValue: number | null) {
        if (newValue === this._hoveredBeat) return;
        this._hoveredBeat = newValue;
        this.subscribable.notifySubscribers();
    }

    set hoveredTrack(newValue: Track | null) {
        if (newValue === this._hoveredTrack) return;
        this._hoveredTrack = newValue;
        this.subscribable.notifySubscribers();
    }

    get hoveredBeat() {
        return this._hoveredBeat;
    }

    get hoveredTrack() {
        return this._hoveredTrack;
    }

    get clickedBeat() {
        return this._clickedBeat;
    }

    get clickedTrack() {
        return this._clickedTrack;
    }
}

export default CursorContext;
