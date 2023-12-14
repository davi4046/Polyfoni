import type Item from "../models/item/Item";

class MoveContext {
    private _ghostPairs: readonly [legit: Item, ghost: Item][] = [];

    set ghostPairs(newGhostPairs: readonly [legit: Item, ghost: Item][]) {
        const oldGhostItems = this._ghostPairs.map((pair) => pair[1]);
        const newGhostItems = newGhostPairs.map((pair) => pair[1]);

        const oldTracks = oldGhostItems.map((item) => item.state.parent);
        const newTracks = newGhostItems.map((item) => item.state.parent);

        const tracks = Array.from(new Set([...oldTracks, ...newTracks]));

        this._ghostPairs = newGhostPairs;

        tracks.forEach((track) => track.notifySubscribers());
    }

    get ghostPairs() {
        return this._ghostPairs;
    }

    get ghostItems() {
        return this._ghostPairs.map((pair) => pair[1]);
    }

    readonly placeGhostItems = () => {
        this._ghostPairs.forEach((pair) => {
            const oldTrack = pair[0].state.parent;
            const newTrack = pair[1].state.parent;

            pair[0].state = pair[1].state;

            oldTrack.state = {
                items: oldTrack.state.items.filter((item) => item !== pair[0]),
            };
            newTrack.state = {
                items: [pair[0], ...newTrack.state.items],
            };
        });
        this.ghostPairs = [];
    };
}

export default MoveContext;
