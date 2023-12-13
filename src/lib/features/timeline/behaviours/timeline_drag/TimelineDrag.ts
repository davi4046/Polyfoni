import type DragBehaviour from "../../../../shared/behaviours/drag/DragBehaviour";
import type TimelineContext from "../../contexts/TimelineContext";
import type Track from "../../models/track/Track";
import findClosestTrack from "../../utils/find_closest_track.ts/findClosestTrack";
import getBeatAtClientX from "../../utils/get_beat_at_client_x/getBeatAtClientX";

abstract class TimelineDrag implements DragBehaviour {
    constructor(private _context: TimelineContext) {}

    abstract handleDrag: (
        fromBeat: number,
        toBeat: number,
        fromTrack: Track,
        toTrack: Track
    ) => void;

    readonly drag = (
        fromX: number,
        toX: number,
        fromY: number,
        toY: number
    ) => {
        const fromBeat = getBeatAtClientX(this._context.timeline, fromX);
        const toBeat = getBeatAtClientX(this._context.timeline, toX);

        const fromTrack = findClosestTrack(this._context.timeline, fromY);
        const toTrack = findClosestTrack(this._context.timeline, toY); // TODO: should round up when dragging down and round down when dragging up

        if (!fromTrack || !toTrack) return;

        this.handleDrag(fromBeat, toBeat, fromTrack, toTrack);
    };

    readonly drop = () => {};
}

export default TimelineDrag;
