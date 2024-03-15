import type TimelineContext from "../context/TimelineContext";
import Item from "../models/Item";
import type Track from "../models/Track";
import { initialContent, type ItemTypes } from "../utils/ItemTypes";
import findClosestTrack from "../utils/screen_utils/findClosestTrack";
import getBeatAtClientX from "../utils/screen_utils/getBeatAtClientX";
import type { MouseEventHandler } from "../../../architecture/mouse-event-handling";
import {
    getNestedArrayOfDescendants,
    getIndex,
    getLastAncestor,
    countAncestors,
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

        const tracks = (
            getNestedArrayOfDescendants(getLastAncestor(this.item), 3).flat(
                Infinity
            ) as Track<any>[]
        ).filter((track) => track.state.allowUserEdit);

        const hoveredIndex = tracks.indexOf(hoveredTrack);
        const clickedIndex = tracks.indexOf(clickedTrack);

        const trackOffset = hoveredIndex - clickedIndex;
        const beatOffset = hoveredBeat - clickedBeat;

        const selectedItems = this.context.selectionManager.state.selectedItems;

        // Will fail if there is no track at newIndex. In that case, no action is needed
        try {
            const ghostPairs = selectedItems.map((item) => {
                const newStart = item.state.start + beatOffset;
                const newEnd = item.state.end + beatOffset;
                const newIndex = tracks.indexOf(getParent(item)) + trackOffset;
                const newTrack = tracks[newIndex];

                const content =
                    item.itemType === newTrack.itemType
                        ? item.state.content
                        : initialContent[
                              newTrack.itemType as keyof ItemTypes
                          ]();

                const clone = new Item(newTrack.itemType, {
                    start: newStart,
                    end: newEnd,
                    content: content,
                    parent: newTrack,
                });

                return [item, clone];
            }) as [Item<any>, Item<any>][];

            this.context.moveManager.ghostPairs = ghostPairs;
        } catch {}
    }

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {
        this.context.moveManager.placeGhostItems();
    }
}

export default ItemHandler;
