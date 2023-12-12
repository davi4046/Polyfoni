import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Item from "../item/Item";

import type Voice from "../voice/Voice";

interface TrackState {
    readonly voice: Voice;
    readonly label: string;
    readonly items: Item[];
}

function createTrackState(options: TrackState) {
    return createWithDefaults(options, {});
}

export { type TrackState, createTrackState };
