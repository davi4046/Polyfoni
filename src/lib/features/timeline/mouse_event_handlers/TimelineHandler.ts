import findClosestTrack from "../_shared/find_closest_track/findClosestTrack";
import getBeatAtClientX from "../_shared/get_beat_at_client_x/getBeatAtClientX";
import getTracksInRange from "../_shared/get_tracks_in_range/getTracksInRange";

import type MouseEventHandler from "../../../shared/architecture/mouse_event_listener/MouseEventHandler";
import type TimelineContext from "../context/TimelineContext";
import type Track from "../models/track/Track";

class TimelineHandler implements MouseEventHandler {
    constructor(readonly context: TimelineContext) {}

    private _prevClickedBeat?: number;
    private _prevHoveredBeat?: number;
    private _prevClickedTrack?: Track<any>;
    private _prevHoveredTrack?: Track<any>;

    handleMouseDown(downEvent: MouseEvent) {
        this.context.selectionManager.deselectAll();
        this.context.highlightManager.highlights = [];
        this.context.editorWidgetManager.closeEditorWigdet();
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

        const newHighlights = getTracksInRange(clickedTrack, hoveredTrack).map(
            (track) => {
                return { track: track, start: minBeat, end: maxBeat };
            }
        );

        this.context.highlightManager.highlights = newHighlights;
    }
}

export default TimelineHandler;
