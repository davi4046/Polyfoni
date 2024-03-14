import Model from "../../../architecture/Model";
import type { ViewModelView } from "../../../architecture/ViewModelView";
import TrackView from "../visuals/views/track/Track.svelte";

import type ItemVM from "./ItemVM";

interface TrackVMState {
    label: string;
}

class TrackVM<
    TState extends TrackVMState = TrackVMState,
> extends Model<TState> {
    constructor(
        readonly View: ViewModelView<TState>,
        state: TState,
        id?: string
    ) {
        super(state, id);
    }
}

export default TrackVM;

export interface ItemTrackVMState extends TrackVMState {
    items: ItemVM[];
}

export class ItemTrackVM extends TrackVM<ItemTrackVMState> {
    constructor(state: ItemTrackVMState, id?: string) {
        super(TrackView, state, id);
    }
}
