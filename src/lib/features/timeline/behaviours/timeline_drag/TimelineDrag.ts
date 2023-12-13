import type DragBehaviour from "../../../../shared/behaviours/drag/DragBehaviour";
import type TimelineContext from "../../contexts/TimelineContext";
import type Track from "../../models/track/Track";
import findClosestTrack from "../../utils/find_closest_track.ts/findClosestTrack";
import getBeatAtClientX from "../../utils/get_beat_at_client_x/getBeatAtClientX";

abstract class TimelineDrag implements DragBehaviour {
    constructor(readonly context: TimelineContext) {}

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

        this.handleDrag(fromBeat, toBeat, fromTrack, toTrack);
    };

    readonly drop = () => this.handleDrop();
}

export default TimelineDrag;
