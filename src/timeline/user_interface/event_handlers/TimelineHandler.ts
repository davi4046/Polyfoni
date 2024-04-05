import { clamp } from "lodash";

import type TimelineContext from "../context/TimelineContext";
import placeGhostItems from "../context/operations/placeGhostItems";
import type { GlobalEventHandler } from "../../../architecture/GlobalEventListener";
import {
    getNestedArrayOfDescendants,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import Highlight from "../../models/highlight/Highlight";
import Item from "../../models/item/Item";
import {
    itemInitialContentFunctions,
    type ItemTypes,
} from "../../models/item/ItemTypes";
import type Timeline from "../../models/timeline/Timeline";
import Track from "../../models/track/Track";
import findClosestTrack from "../../utils/screen_utils/findClosestTrack";
import getBeatAtClientX from "../../utils/screen_utils/getBeatAtClientX";

export default class TimelineHandler implements GlobalEventHandler {
    constructor(
        readonly timeline: Timeline,
        readonly context: TimelineContext
    ) {
        this._pasteItemsHandler = new PasteItemsHandler(timeline, context);
    }

    private _clickedBeat?: number;
    private _clickedTrack?: Track<any>;

    private _prevMinBeat?: number;
    private _prevMaxBeat?: number;

    private _prevHoveredTrack?: Track<any>;

    private _pasteItemsHandler;

    getIsOverwritable(): boolean {
        return (
            !this._clickedBeat &&
            !this._clickedTrack &&
            this.context.state.ghostPairs.length === 0
        );
    }

    handleMouseDown(event: MouseEvent) {
        this._clickedBeat = getBeatAtClientX(
            this.context.timeline,
            event.clientX
        );

        this._clickedTrack = findClosestTrack(
            this.context.timeline,
            event.clientY
        );

        this.context.state = {
            highlights: [],
            selectedItems: [],
            editItem: undefined,
        };
    }

    handleMouseMove(event: MouseEvent) {
        this._pasteItemsHandler.handleMouseMove(event);

        if (!this._clickedBeat || !this._clickedTrack) return;

        const hoveredBeat = getBeatAtClientX(
            this.context.timeline,
            event.clientX
        );

        const hoveredTrack = findClosestTrack(
            this.context.timeline,
            event.clientY
        );

        const minBeat = Math.floor(Math.min(hoveredBeat, this._clickedBeat));
        const maxBeat = Math.ceil(Math.max(hoveredBeat, this._clickedBeat));

        if (
            minBeat === this._prevMinBeat &&
            maxBeat === this._prevMaxBeat &&
            hoveredTrack === this._prevHoveredTrack
        ) {
            return;
        }

        this._prevMinBeat = minBeat;
        this._prevMaxBeat = maxBeat;
        this._prevHoveredTrack = hoveredTrack;

        if (!hoveredTrack) return;

        const tracks = getNestedArrayOfDescendants(
            this.context.timeline,
            3
        ).flat(Infinity) as Track<any>[];

        const hoveredIndex = tracks.indexOf(hoveredTrack);
        const clickedIndex = tracks.indexOf(this._clickedTrack);

        const minIndex = Math.min(hoveredIndex, clickedIndex);
        const maxIndex = Math.max(hoveredIndex, clickedIndex);

        const tracksInRange = tracks.slice(minIndex, maxIndex + 1);

        const newHighlights = tracksInRange.map((track) => {
            return new Highlight({
                start: minBeat,
                end: maxBeat,
                parent: track,
            });
        });

        this.context.state = {
            highlights: newHighlights,
        };
    }

    handleMouseUp(event: MouseEvent) {
        this._clickedBeat = undefined;
        this._clickedTrack = undefined;

        if (this.context.state.ghostPairs.length > 0) {
            this._pasteItemsHandler.handleMouseDown(event);
        } else if (this.context.state.highlights.length === 0) {
            const hoveredBeat = getBeatAtClientX(
                this.context.timeline,
                event.clientX
            );
            this.context.player.setPlaybackPosition(Math.round(hoveredBeat));
        }
    }
}

class PasteItemsHandler implements GlobalEventHandler {
    constructor(
        readonly timeline: Timeline,
        readonly context: TimelineContext
    ) {}

    private _prevHoveredBeat?: number;
    private _prevHoveredTrack?: Track<any>;

    handleMouseMove(event: MouseEvent) {
        if (this.context.state.ghostPairs.length === 0) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, event.clientX)
        );

        const hoveredTrack = findClosestTrack(
            this.context.timeline,
            event.clientY,
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

        if (!hoveredTrack) return;

        const tracks = (
            getNestedArrayOfDescendants(this.timeline, 3).flat(
                Infinity
            ) as Track<any>[]
        ).filter((track) => track.state.allowUserEdit);

        const minStart = this.context.state.ghostPairs.reduce(
            (minStart, [item]) =>
                item.state.start < minStart ? item.state.start : minStart,
            Number.MAX_SAFE_INTEGER
        );

        const trackIndeces = this.context.state.ghostPairs.map(([item]) =>
            tracks.indexOf(getParent(item))
        );

        const minTrackIndex = trackIndeces.reduce(
            (min, curr) => (curr < min ? curr : min),
            Number.MAX_SAFE_INTEGER
        );

        const maxTrackIndex = trackIndeces.reduce(
            (max, curr) => (max > curr ? max : curr),
            Number.MIN_SAFE_INTEGER
        );

        const trackIndexOffset = clamp(
            tracks.indexOf(hoveredTrack),
            -minTrackIndex,
            tracks.length + minTrackIndex - maxTrackIndex - 1
        );

        const newGhostPairs = this.context.state.ghostPairs.map(([item]) => {
            const newTrackIndex =
                tracks.indexOf(getParent(item)) -
                minTrackIndex +
                trackIndexOffset;
            const newTrack = tracks[newTrackIndex];

            const content =
                item.itemType === newTrack.itemType
                    ? item.state.content
                    : itemInitialContentFunctions[
                          newTrack.itemType as keyof ItemTypes
                      ]();

            return [
                item,
                new Item(newTrack.itemType, {
                    start: item.state.start - minStart + hoveredBeat,
                    end: item.state.end - minStart + hoveredBeat,
                    content: content,
                    parent: newTrack,
                }),
            ] as [Item<any>, Item<any>];
        });

        this.context.state = {
            ghostPairs: newGhostPairs,
        };
    }

    handleMouseDown(event: MouseEvent) {
        this.context.history.startAction("Paste items");
        placeGhostItems(this.context);
        this.context.history.endAction();
    }
}
