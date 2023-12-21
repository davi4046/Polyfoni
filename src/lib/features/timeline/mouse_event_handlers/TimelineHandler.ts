import MouseEventHandler from "../../../shared/mouse_event_listener/MouseEventHandler";
import findClosestTrack from "../utils/find_closest_track/findClosestTrack";
import getBeatAtClientX from "../utils/get_beat_at_client_x/getBeatAtClientX";
import getTracksInRange from "../utils/get_tracks_in_range/getTracksInRange";

import type MouseEventHandler from "../../../shared/mouse_event_listener/MouseEventHandler";
import type TimelineContext from "../contexts/TimelineContext";

class TimelineHandler implements MouseEventHandler {
    constructor(readonly context: TimelineContext) {}

    handleMouseDown(downEvent: MouseEvent) {
        if (downEvent.shiftKey) return;
        this.context.selectionManager.deselectAll();
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
            !hoveredTrack ||
            !clickedTrack ||
            (hoveredBeat === clickedBeat && hoveredTrack === clickedTrack)
        ) {
            return;
        }

        this.context.highlightManager.highlights = getTracksInRange(
            clickedTrack,
            hoveredTrack
        ).map((track) => {
            return { track: track, start: minBeat, end: maxBeat };
        });
    }

    handleMouseUp(upEvent: MouseEvent, downEvent: MouseEvent) {}
}

export default TimelineHandler;
