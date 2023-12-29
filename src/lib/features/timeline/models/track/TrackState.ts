import type ParentChildState from "../../../../shared/architecture/state/ParentChildState";
import createWithDefaults from "../../../../shared/utils/create_with_defaults/createWithDefaults";

import type Item from "../item/Item";

import type Voice from "../voice/Voice";

interface TrackState<TItem extends Item<any>>
    extends ParentChildState<Voice, TItem> {
    readonly label: string;
}

function createTrackState<TItem extends Item<any>>(options: TrackState<TItem>) {
    return createWithDefaults(options, {});
}

export { type TrackState, createTrackState };
