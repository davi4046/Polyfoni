import type Track from "../models/track/Track";

class CursorContext {
    hoveredTrack: Track | null = null;
    clickedTrack: Track | null = null;
    hoveredBeat: number | null = null;
    clickedBeat: number | null = null;
}

export default CursorContext;
