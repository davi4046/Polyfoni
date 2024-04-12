import { getGrandparent } from "../../../../architecture/state-hierarchy-utils";
import type Track from "../../../models/track/Track";

export function deriveTrackLabel(track: Track<any>): string {
    switch (track.state.role) {
        case "timeline_tempo":
            return "Tempo";
        case "timeline_scale":
            return "Scale";
        case "timeline_total":
            return "Total Harmony";
        case "output":
            return getGrandparent(track).state.label;
        case "pitch":
            return "Pitch";
        case "duration":
            return "Duration";
        case "rest":
            return "Rest";
        case "harmony":
            return "Harmony";
    }
}
