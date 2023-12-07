import createWithDefaults from '../../../../shared/utils/create_with_defaults/createWithDefaults';

import type ItemVM from "../item/ItemVM";

interface TrackVMState {
    readonly label: string;
    readonly items: ItemVM[];
}

function createTrackVMState(options: TrackVMState) {
    return createWithDefaults(options, {});
}

export { type TrackVMState, createTrackVMState };
