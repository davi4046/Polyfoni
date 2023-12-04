import type ItemVM from "../item/ItemVM";

class TrackVMState {
    constructor(
        readonly label: string,
        readonly items: ItemVM[]
    ) {}
}

export default TrackVMState;
