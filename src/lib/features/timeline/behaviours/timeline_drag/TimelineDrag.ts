import type DragBehaviour from "../../../../shared/behaviours/drag/DragBehaviour";
import type TimelineContext from "../../contexts/TimelineContext";
import type Track from "../../models/track/Track";
import findClosestTrack from "../../utils/find_closest_track.ts/findClosestTrack";
import getBeatAtClientX from "../../utils/get_beat_at_client_x/getBeatAtClientX";

abstract class TimelineDrag implements DragBehaviour {
    constructor(readonly context: TimelineContext) {}

    private _prevFromBeat: number | null = null;
    private _prevToBeat: number | null = null;
    private _prevFromTrack: Track | null = null;
    private _prevToTrack: Track | null = null;

    protected abstract handleDrag(
        fromBeat: number,
        toBeat: number,
        fromTrack: Track,
        toTrack: Track
    ): void;

    protected abstract handleDrop(): void;

    readonly drag = (
        fromX: number,
        toX: number,
        fromY: number,
        toY: number
    ) => {
        const fromBeat = getBeatAtClientX(this.context.timeline, fromX);
        const toBeat = getBeatAtClientX(this.context.timeline, toX);

        const fromTrack = findClosestTrack(this.context.timeline, fromY);
        const toTrack = findClosestTrack(this.context.timeline, toY); // TODO: should round up when dragging down and round down when dragging up

        if (!fromTrack || !toTrack) return;

        if (
            fromBeat === this._prevFromBeat &&
            toBeat === this._prevToBeat &&
            fromTrack === this._prevFromTrack &&
            toTrack === this._prevToTrack
        ) {
            return;
        }

        this.handleDrag(fromBeat, toBeat, fromTrack, toTrack);

        this._prevFromBeat = fromBeat;
        this._prevToBeat = toBeat;
        this._prevFromTrack = fromTrack;
        this._prevToTrack = toTrack;
    };

    readonly drop = () => this.handleDrop();
}

export default TimelineDrag;
