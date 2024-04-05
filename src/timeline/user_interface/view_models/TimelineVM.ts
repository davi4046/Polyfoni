import type { SvelteComponent } from "svelte";

import Model from "../../../architecture/Model";
import type { PlaybackMotion } from "../../features/playback/TimelinePlayer";
import type { Chord } from "../../models/item/Chord";

import type VoiceVM from "./VoiceVM";

interface TimelineVMState {
    top: VoiceVM[];
    center: VoiceVM[];
    bottom: VoiceVM[];

    handleMouseMove: (event: MouseEvent) => void;
    handleMouseMove_tracks: (event: MouseEvent) => void;

    playbackMotion: PlaybackMotion;
    isPlaying: boolean;

    onPlayButtonClick: (event: MouseEvent) => void;
    onPauseButtonClick: (event: MouseEvent) => void;
    onStopButtonClick: (event: MouseEvent) => void;

    displayHarmony?: Chord;

    createItemEditor?: (
        target: Element | Document | ShadowRoot
    ) => SvelteComponent;

    idPrefix: string;
}

export default class TimelineVM extends Model<TimelineVMState> {}
