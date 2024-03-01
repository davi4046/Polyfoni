import type Track from "../../models/track/Track";

interface TrackInterval {
    track: Track<any>;
    start: number;
    end: number;
}

export type { TrackInterval as default };
