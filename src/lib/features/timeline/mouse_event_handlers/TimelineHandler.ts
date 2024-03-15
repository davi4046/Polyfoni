import type TimelineContext from "../context/TimelineContext";
import Highlight from "../models/Highlight";
import Track from "../models/Track";
import findClosestTrack from "../utils/screen_utils/findClosestTrack";
import getBeatAtClientX from "../utils/screen_utils/getBeatAtClientX";
import type { MouseEventHandler } from "../../../architecture/mouse-event-handling";
import { getNestedArrayOfDescendants } from "../../../architecture/state-hierarchy-utils";

class TimelineHandler implements MouseEventHandler {
    constructor(readonly context: TimelineContext) {}

    private _prevClickedBeat?: number;
    private _prevHoveredBeat?: number;
    private _prevClickedTrack?: Track<any>;
    private _prevHoveredTrack?: Track<any>;

    handleMouseDown(downEvent: MouseEvent) {
        this.context.state = {
            highlights: [],
            selectedItems: [],
            editItem: undefined,
        };
    }

    handleMouseMove(moveEvent: MouseEvent, downEvent?: MouseEvent) {
        if (!downEvent) return;

        const hoveredBeat = getBeatAtClientX(
            this.context.timeline,
            moveEvent.clientX
        );

        const clickedBeat = getBeatAtClientX(
            this.context.timeline,
            downEvent.clientX
        );

        const minBeat = Math.floor(Math.min(hoveredBeat, clickedBeat));
        const maxBeat = Math.ceil(Math.max(hoveredBeat, clickedBeat));

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
            return;
        }

        const tracks = getNestedArrayOfDescendants(
            this.context.timeline,
            3
        ).flat(Infinity) as Track<any>[];

        const hoveredIndex = tracks.indexOf(hoveredTrack);
        const clickedIndex = tracks.indexOf(clickedTrack);

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
}

export default TimelineHandler;
