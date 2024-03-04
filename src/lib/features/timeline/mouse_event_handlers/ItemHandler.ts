import type TimelineContext from "../context/TimelineContext";
import Item from "../models/Item";
import type Track from "../models/Track";
import findClosestTrack from "../utils/screen_utils/findClosestTrack";
import getBeatAtClientX from "../utils/screen_utils/getBeatAtClientX";
import type { MouseEventHandler } from "../../../architecture/mouse-event-handling";
import {
    getIndex,
    getParent,
} from "../../../architecture/state-hierarchy-utils";

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
        if (this.context.selectionManager.isSelected(this.item)) {
            this.context.editorWidgetManager.openItemEditorWidget(this.item);
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

        const beatOffset = hoveredBeat - clickedBeat;

        const trackOffset = getIndex(hoveredTrack) - getIndex(clickedTrack);

        const voiceOffset =
            getIndex(getParent(hoveredTrack)) -
            getIndex(getParent(clickedTrack));

        const items = this.context.selectionManager.state.selectedItems;

        const movedItems = Item.offsetBunchOfItems(
            items,
            beatOffset,
            trackOffset,
            voiceOffset
        );

        const ghostPairs: [legit: Item<any>, ghost: Item<any>][] = [];

        items.map((item, index) => ghostPairs.push([item, movedItems[index]]));

        this.context.moveManager.ghostPairs = ghostPairs;
    }

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {
        this.context.moveManager.placeGhostItems();
    }
}

export default ItemHandler;
