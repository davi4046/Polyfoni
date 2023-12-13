import type Item from "../models/item/Item";

class MoveContext {
    private _ghostItems: readonly Item[] = [];

    set ghostItems(newGhostItems: readonly Item[]) {
        const oldTracks = this._ghostItems.map((item) => item.state.track);
        const newTracks = newGhostItems.map((item) => item.state.track);
        const tracks = Array.from(new Set([...oldTracks, ...newTracks]));

        this._ghostItems = newGhostItems;

        tracks.forEach((track) => track.subscribable.notifySubscribers());
    }

    get ghostItems() {
        return this._ghostItems;
    }
}

export default MoveContext;
