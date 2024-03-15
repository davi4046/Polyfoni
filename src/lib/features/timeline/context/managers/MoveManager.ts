import type Item from "./../../models/Item";
import Stateful from "../../../../architecture/Stateful";
import {
    addChildren,
    getParent,
    removeChildren,
} from "../../../../architecture/state-hierarchy-utils";

type ItemPair = [Item<any>, Item<any>];

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
            addChildren(newTrack, pair[0]);
        });
        this.state = {
            ghostPairs: [],
        };
    };
}

export default MoveManager;
