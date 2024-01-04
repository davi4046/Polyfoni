import { getIndex, getParent } from '../../../shared/architecture/state/state_utils';
import findClosestTrack from '../_shared/find_closest_track/findClosestTrack';
import getBeatAtClientX from '../_shared/get_beat_at_client_x/getBeatAtClientX';
import offsetItems from '../_shared/offset_items/offsetItems';
import Item from '../models/item/Item';

import type MouseEventHandler from "../../../shared/architecture/mouse_event_listener/MouseEventHandler";
import type TimelineContext from "../context/TimelineContext";
import type Track from "../models/track/Track";

class ItemHandler implements MouseEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item<any>
    ) {}

    private _prevClickedBeat?: number;
    private _prevHoveredBeat?: number;
    private _prevClickedTrack?: Track<any>;
    private _prevHoveredTrack?: Track<any>;

    handleMouseDown(downEvent: MouseEvent) {
        if (downEvent.shiftKey) {
            this.context.selectionManager.toggleSelected(this.item);
        } else {
            this.context.selectionManager.deselectAll();
            this.context.selectionManager.selectItem(this.item);
        }
        downEvent.stopPropagation();
    }

    handleMouseMove(moveEvent: MouseEvent, downEvent?: MouseEvent) {
        if (!downEvent) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, moveEvent.clientX)
        );
        const clickedBeat = Math.round(
            getBeatAtClientX(this.context.timeline, downEvent.clientX)
        );

        const hoveredTrack = findClosestTrack(
            this.context.timeline,
            moveEvent.clientY
        );
        const clickedTrack = findClosestTrack(
            this.context.timeline,
            downEvent.clientY
        );

        if (
            clickedBeat === this._prevClickedBeat &&
            hoveredBeat === this._prevHoveredBeat &&
            clickedTrack === this._prevClickedTrack &&
            hoveredTrack === this._prevHoveredTrack
        ) {
            return;
        }

        this._prevClickedBeat = clickedBeat;
        this._prevHoveredBeat = hoveredBeat;
        this._prevClickedTrack = clickedTrack;
        this._prevHoveredTrack = hoveredTrack;

        if (
            !hoveredTrack ||
            !clickedTrack ||
            (hoveredBeat === clickedBeat && hoveredTrack === clickedTrack)
        ) {
            this.context.moveManager.ghostPairs = [];
            return;
        }

        const ghostPairs = this.context.selectionManager.selectedItems.map(
            (item) => {
                return [item, new Item(item.itemType, item.state)] as [
                    legit: typeof item,
                    ghost: typeof item,
                ];
            }
        );

        const beatOffset = hoveredBeat - clickedBeat;

        const trackOffset = getIndex(hoveredTrack) - getIndex(clickedTrack);

        const voiceOffset =
            getIndex(getParent(hoveredTrack)) -
            getIndex(getParent(clickedTrack));

        offsetItems(
            ghostPairs.map((pair) => pair[1]),
            beatOffset,
            trackOffset,
            voiceOffset
        );

        this.context.moveManager.ghostPairs = ghostPairs;
    }

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {
        this.context.moveManager.placeGhostItems();
    }
}

export default ItemHandler;
