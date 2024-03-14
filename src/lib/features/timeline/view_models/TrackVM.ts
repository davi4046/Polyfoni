import Model from "../../../architecture/Model";
import type { ViewModelView } from "../../../architecture/ViewModelView";
import ItemTrackView from "../visuals/views/item_track/ItemTrack.svelte";
import NoteTrackView from "../visuals/views/note_track/NoteTrack.svelte";

import type ItemVM from "./ItemVM";
import type NoteVM from "./NoteVM";

interface TrackVMState {
    label: string;
}

class TrackVM<TState extends TrackVMState> extends Model<TState> {
    constructor(
        readonly View: ViewModelView<TState>,
        state: TState,
        id?: string
    ) {
        super(state, id);
    }
}

export default TrackVM;

// ItemTrackVM

export interface ItemTrackVMState extends TrackVMState {
    items: ItemVM[];
}

export class ItemTrackVM extends TrackVM<ItemTrackVMState> {
    constructor(state: ItemTrackVMState, id?: string) {
        super(ItemTrackView, state, id);
    }
}

// NoteTrackVM

export interface NoteTrackVMState extends TrackVMState {
    items: NoteVM[];
}

export class NoteTrackVM extends TrackVM<NoteTrackVMState> {
    constructor(state: NoteTrackVMState, id?: string) {
        super(NoteTrackView, state, id);
    }
}
