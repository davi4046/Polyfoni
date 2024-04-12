import type { SvelteComponent } from "svelte";

import Stateful from "../../../architecture/Stateful";
import type { PlaybackMotion } from "../../features/playback/TimelinePlayer";
import type { Chord } from "../../models/item/Chord";

import type VoiceGroupVM from "./VoiceGroupVM";

interface TimelineVMState {
    top: VoiceGroupVM;
    center: VoiceGroupVM;
    bottom: VoiceGroupVM;

    handleMouseMove: (event: MouseEvent) => void;
    handleMouseMove_tracks: (event: MouseEvent) => void;

    playbackMotion: PlaybackMotion;
    isPlaying: boolean;

    onPlayButtonClick: (event: MouseEvent) => void;
    onPauseButtonClick: (event: MouseEvent) => void;
    onStopButtonClick: (event: MouseEvent) => void;

    displayHarmony?: Chord;

    createItemEditor?: (target: Element) => SvelteComponent;

    idPrefix: string;
}

export default class TimelineVM extends Stateful<TimelineVMState> {}
