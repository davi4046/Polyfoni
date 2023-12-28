import type ParentChildState from "../../../../shared/architecture/state/ParentChildState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Item from "../item/Item";

import type Voice from "../voice/Voice";

interface TrackState extends ParentChildState<Voice, Item> {
    readonly label: string;
}

function createTrackState(options: TrackState) {
    return createWithDefaults(options, {});
}

export { type TrackState, createTrackState };
