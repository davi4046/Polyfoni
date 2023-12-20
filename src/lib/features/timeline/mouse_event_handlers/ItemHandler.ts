import { getIndex, getParent } from "../../../shared/state/state_utils";
import Item from "../models/item/Item";
import findClosestTrack from "../utils/find_closest_track/findClosestTrack";
import getBeatAtClientX from "../utils/get_beat_at_client_x/getBeatAtClientX";
import offsetItems from "../utils/offset_items/offsetItems";

import type TimelineContext from "../contexts/TimelineContext";

class ItemHandler implements MouseEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item
    ) {}

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
            !hoveredTrack ||
            !clickedTrack ||
            (hoveredBeat === clickedBeat && hoveredTrack === clickedTrack)
        ) {
            this.context.moveManager.ghostPairs = [];
            return;
        }

        const ghostPairs = this.context.selectionManager.selectedItems.map(
            (item) => {
                return [item, new Item(() => item.state)] as [
                    legit: Item,
                    ghost: Item,
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
