import type Item from "../../../models/item/Item";
import Stateful from "../../../../../shared/architecture/stateful/Stateful";
import {
    addChildren,
    getParent,
    removeChildren,
} from "../../../../../shared/architecture/state/state_utils";

type ItemPair = [legit: Item<any>, ghost: Item<any>];

interface MoveManagerState {
    ghostPairs: readonly ItemPair[];
}

class MoveManager extends Stateful<MoveManagerState> {
    constructor() {
        super({ ghostPairs: [] });
    }

    set ghostPairs(newGhostPairs: readonly ItemPair[]) {
        this.state = {
            ghostPairs: newGhostPairs,
        };
    }

    get ghostItems() {
        return this.state.ghostPairs.map((pair) => pair[1]);
    }

    readonly placeGhostItems = () => {
        this.state.ghostPairs.forEach((pair) => {
            const oldTrack = getParent(pair[0]);
            const newTrack = getParent(pair[1]);

            pair[0].state = pair[1].state;

            newTrack.cropItemsByInterval(
                pair[1].state.start,
                pair[1].state.end
            );

            removeChildren(oldTrack, pair[0]);
            addChildren(newTrack, pair[1]);
        });
        this.state = {
            ghostPairs: [],
        };
    };
}

export default MoveManager;
