import { getIndex, getParent } from "../../../shared/state/state_utils";
import Item from "../models/item/Item";
import findClosestTrack from "../utils/find_closest_track.ts/findClosestTrack";
import getBeatAtClientX from "../utils/get_beat_at_client_x/getBeatAtClientX";
import offsetItems from "../utils/offset_items/offsetItems";

import type TimelineContext from "../contexts/TimelineContext";

class ItemHandler implements MouseEventHandler {
    constructor(readonly context: TimelineContext) {}

    handleMouseDown(clickedPoint: Point) {}

    handleMouseMove(hoveredPoint: Point, clickedPoint?: Point) {
        if (!clickedPoint) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, hoveredPoint.x)
        );

        const clickedBeat = Math.round(
            getBeatAtClientX(this.context.timeline, clickedPoint.x)
        );

        const hoveredTrack = findClosestTrack(
            this.context.timeline,
            hoveredPoint.y
        ); // TODO: should round up when dragging down and round down when dragging up

        const clickedTrack = findClosestTrack(
            this.context.timeline,
            clickedPoint.y
        );

        if (
            !hoveredTrack ||
            !clickedTrack ||
            (hoveredBeat === clickedBeat && hoveredTrack === clickedTrack)
        ) {
            this.context.move.ghostPairs = [];
            return;
        }

        const ghostPairs = this.context.selection.selectedItems.map((item) => {
            return [item, new Item(() => item.state)] as [
                legit: Item,
                ghost: Item,
            ];
        });

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

        this.context.move.ghostPairs = ghostPairs;
    }

    handleMouseUp(hoveredPoint: Point, clickedPoint: Point) {
        this.context.move.placeGhostItems();
    }
}

export default ItemHandler;
