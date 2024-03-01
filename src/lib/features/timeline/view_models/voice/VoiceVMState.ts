import type TrackVM from "../track/TrackVM";

interface VoiceVMState {
    readonly tracks: TrackVM[];
    readonly isCollapsed?: boolean;
}

export { type VoiceVMState };
