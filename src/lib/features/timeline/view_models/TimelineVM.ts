import type Item from "../models/Item";
import type { PlaybackMotion } from "../../playback/TimelinePlayer";
import Model from "../../../architecture/Model";
import type { SvelteCtorMatchProps } from "../../../utils/svelte-utils";

import type VoiceVM from "./VoiceVM";

interface TimelineVMState {
    top: VoiceVM[];
    center: VoiceVM[];
    bottom: VoiceVM[];

    handleMouseMove: (event: MouseEvent) => void;
    handleMouseMove_tracks: (event: MouseEvent) => void;

    editorWidget?: SvelteCtorMatchProps<{ item: Item<any> }>;

    onPlayButtonClick: (event: MouseEvent) => void;
    onPauseButtonClick: (event: MouseEvent) => void;
    onStopButtonClick: (event: MouseEvent) => void;

    playbackMotion: PlaybackMotion;
}

export default class TimelineVM extends Model<TimelineVMState> {}
