import type TimelineContext from "../context/TimelineContext";
import type { GlobalEventHandler } from "../../../architecture/GlobalEventListener";
import { getNestedArrayOfDescendants } from "../../../architecture/state-hierarchy-utils";
import Highlight from "../../models/highlight/Highlight";
import Track from "../../models/track/Track";
import findClosestTrack from "../../utils/screen_utils/findClosestTrack";
import getBeatAtClientX from "../../utils/screen_utils/getBeatAtClientX";

export default class TimelineHandler implements GlobalEventHandler {
    constructor(readonly context: TimelineContext) {}

    private _clickedBeat?: number;
    private _clickedTrack?: Track<any>;

    private _prevMinBeat?: number;
    private _prevMaxBeat?: number;

    private _prevHoveredTrack?: Track<any>;

    getIsOverwritable(): boolean {
        return !this._clickedBeat && !this._clickedTrack;
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
        this._prevMinBeat = undefined;
        this._prevMaxBeat = undefined;
        this._prevHoveredTrack = undefined;

        const currBeat = getBeatAtClientX(this.context.timeline, event.clientX);

        if (this.context.state.highlights.length === 0) {
            this.context.player.setPlaybackPosition(Math.round(currBeat));
        }
    }
}
