import {
    addChildren,
    getParent,
    removeChildren,
} from "../../../shared/state/state_utils";

import type Item from "../models/item/Item";
class MoveContext {
    private _ghostPairs: readonly [legit: Item, ghost: Item][] = [];

    set ghostPairs(newGhostPairs: readonly [legit: Item, ghost: Item][]) {
        const oldGhostItems = this._ghostPairs.map((pair) => pair[1]);
        const newGhostItems = newGhostPairs.map((pair) => pair[1]);

        const oldTracks = oldGhostItems.map((item) => getParent(item));
        const newTracks = newGhostItems.map((item) => getParent(item));

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
            const oldTrack = getParent(pair[0]);
            const newTrack = getParent(pair[1]);

            pair[0].state = pair[1].state;

            removeChildren(oldTrack, pair[0]);
            addChildren(newTrack, pair[0]);
        });
        this.ghostPairs = [];
    };
}

export default MoveContext;
