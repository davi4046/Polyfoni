import createVMState from "../../../../shared/utils/create_vm_state/createVMState";

import type ItemVM from "../item/ItemVM";

interface TrackVMState {
    readonly label: string;
    readonly items: ItemVM[];
}

function createTrackVMState(options: TrackVMState) {
    return createVMState(options, {});
}

export { type TrackVMState, createTrackVMState };
