import type VoiceVM from "../voice/VoiceVM";

interface TimelineVMState {
    readonly top?: VoiceVM[];
    readonly center?: VoiceVM[];
    readonly bottom?: VoiceVM[];
    readonly handleMouseMove_tracks?: (event: MouseEvent) => void;
    readonly handleMouseMove_others?: (event: MouseEvent) => void;
}

export { type TimelineVMState };
