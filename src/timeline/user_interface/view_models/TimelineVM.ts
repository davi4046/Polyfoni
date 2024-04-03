import type TimelineContext from "../context/TimelineContext";
import Model from "../../../architecture/Model";
import type { SvelteCtorMatchProps } from "../../../utils/svelte-utils";
import type { PlaybackMotion } from "../../features/playback/TimelinePlayer";
import type { Chord } from "../../models/item/Chord";
import type Item from "../../models/item/Item";

import type VoiceVM from "./VoiceVM";

interface TimelineVMState {
    top: VoiceVM[];
    center: VoiceVM[];
    bottom: VoiceVM[];

    handleMouseMove: (event: MouseEvent) => void;
    handleMouseMove_tracks: (event: MouseEvent) => void;

    editorWidget?: SvelteCtorMatchProps<{
        item: Item<any>;
        context: TimelineContext;
    }>;

    onPlayButtonClick: (event: MouseEvent) => void;
    onPauseButtonClick: (event: MouseEvent) => void;
    onStopButtonClick: (event: MouseEvent) => void;

    playbackMotion: PlaybackMotion;
    isPlaying: boolean;

    displayHarmony?: Chord;
}

export default class TimelineVM extends Model<TimelineVMState> {}
