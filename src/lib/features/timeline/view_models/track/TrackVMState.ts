import type ItemVM from "../item/ItemVM";

interface TrackVMState {
    readonly label: string;
    readonly items: ItemVM[];
}

export { type TrackVMState };
