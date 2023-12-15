import { getParent } from "../../../../../shared/state/state_utils";
import clamp from "../../../../../shared/utils/math_utils/clamp/clamp";
import clearTrackInterval from "../../../utils/clear_track_interval/clearTrackInterval";
import TimelineDrag from "../TimelineDrag";

import type TimelineContext from "../../../contexts/TimelineContext";
import type Item from "../../../models/item/Item";
import type Track from "../../../models/track/Track";

enum HandleType {
    StartHandle,
    EndHandle,
}

class ItemHandleDrag extends TimelineDrag {
    private _item: Item;
    private _handleType: HandleType;

    constructor(context: TimelineContext, item: Item, handleType: HandleType) {
        super(context);
        this._item = item;
        this._handleType = handleType;
    }

    protected handleDrag(
        fromBeat: number,
        toBeat: number,
        fromTrack: Track,
        toTrack: Track
    ): void {
        if (this._handleType === HandleType.StartHandle) {
            this._item.state = {
                start: clamp(toBeat, 0, this._item.state.end - 1),
            };
        } else {
            this._item.state = {
                end: Math.max(toBeat, this._item.state.start + 1),
            };
        }
    }

    protected handleDrop(): void {
        clearTrackInterval(
            getParent(this._item),
            this._item.state.start,
            this._item.state.end,
            [this._item]
        );
    }

    protected handleReset(): void {}
}

export default ItemHandleDrag;
