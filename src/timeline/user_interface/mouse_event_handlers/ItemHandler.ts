import type TimelineContext from "../context/TimelineContext";
import placeGhostItems from "../context/operations/placeGhostItems";
import toggleItemSelected from "../context/operations/toggleItemSelected";
import type { MouseEventHandler } from "../../../architecture/mouse-event-handling";
import {
    getNestedArrayOfDescendants,
    getLastAncestor,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import Item from "../../models/item/Item";
import {
    itemInitialContentFunctions,
    type ItemTypes,
} from "../../models/item/ItemTypes";
import type Track from "../../models/track/Track";
import findClosestTrack from "../../utils/screen_utils/findClosestTrack";
import getBeatAtClientX from "../../utils/screen_utils/getBeatAtClientX";

export default class ItemHandler implements MouseEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item<any>
    ) {}

    private _clickedBeat?: number;
    private _clickedTrack?: Track<any>;

    private _prevHoveredBeat?: number;
    private _prevHoveredTrack?: Track<any>;

    handleMouseDown(downEvent: MouseEvent) {
        if (downEvent.shiftKey) {
            toggleItemSelected(this.context, this.item);
        } else {
            this.context.state = {
                selectedItems: [this.item],
            };
        }
        this.context.state = {
            editItem: this.item,
        };
        this._clickedBeat = Math.round(
            getBeatAtClientX(this.context.timeline, downEvent.clientX)
        );
        this._clickedTrack = findClosestTrack(
            this.context.timeline,
            downEvent.clientY,
            (track) => track.state.allowUserEdit
        );
        downEvent.stopPropagation();
    }

    handleMouseMove(moveEvent: MouseEvent, downEvent?: MouseEvent) {
        if (!this._clickedBeat || !this._clickedTrack) {
            document.body.style.cursor = "pointer";
            return;
        }

        document.body.style.cursor = "grabbing";

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, moveEvent.clientX)
        );

        const hoveredTrack = findClosestTrack(
            this.context.timeline,
            moveEvent.clientY,
            (track) => track.state.allowUserEdit
        );

        if (
            hoveredBeat === this._prevHoveredBeat &&
            hoveredTrack === this._prevHoveredTrack
        ) {
            return;
        }
        this._prevHoveredBeat = hoveredBeat;
        this._prevHoveredTrack = hoveredTrack;

        if (
            !hoveredTrack ||
            (hoveredBeat === this._clickedBeat &&
                hoveredTrack === this._clickedTrack)
        ) {
            this.context.state = {
                ghostPairs: [],
            };
            return;
        }

        const tracks = (
            getNestedArrayOfDescendants(getLastAncestor(this.item), 3).flat(
                Infinity
            ) as Track<any>[]
        ).filter((track) => track.state.allowUserEdit);

        const hoveredIndex = tracks.indexOf(hoveredTrack);
        const clickedIndex = tracks.indexOf(this._clickedTrack);

        const trackOffset = hoveredIndex - clickedIndex;
        const beatOffset = hoveredBeat - this._clickedBeat;

        const selectedItems = this.context.state.selectedItems;

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
                        : itemInitialContentFunctions[
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

            this.context.state = {
                ghostPairs: ghostPairs,
            };
        } catch {}
    }

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {
        this._clickedBeat = undefined;
        this._clickedTrack = undefined;
        this._prevHoveredBeat = undefined;
        this._prevHoveredTrack = undefined;
        placeGhostItems(this.context);
    }
}
