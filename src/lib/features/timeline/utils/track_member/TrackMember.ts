import type Track from "../../models/track/Track";

interface TrackMember {
    track: Track<any>;
    start: number;
    end: number;
}

export type { TrackMember as default };
