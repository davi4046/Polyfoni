import { getIndex, getParent } from "../../../../../shared/state/state_utils";
import Item from "../../../models/item/Item";
import offsetItems from "../../../utils/offset_items/offsetItems";
import TimelineDrag from "../TimelineDrag";

import type Track from "../../../models/track/Track";

class ItemDrag extends TimelineDrag {
    protected handleDrag(
        fromBeat: number,
        toBeat: number,
        fromTrack: Track,
        toTrack: Track
    ) {
        if (fromBeat === toBeat && fromTrack === toTrack) {
            this.context.move.ghostPairs = [];
            return;
        }

        const ghostPairs = this.context.selection.selectedItems.map((item) => {
            return [item, new Item(() => item.state)] as [
                legit: Item,
                ghost: Item,
            ];
        });

        const beatOffset = toBeat - fromBeat;

        const trackOffset = getIndex(toTrack) - getIndex(fromTrack);

        const voiceOffset =
            getIndex(getParent(toTrack)) - getIndex(getParent(fromTrack));

        offsetItems(
            ghostPairs.map((pair) => pair[1]),
            beatOffset,
            trackOffset,
            voiceOffset
        );

        this.context.move.ghostPairs = ghostPairs;
    }

    protected handleDrop() {
        this.context.move.placeGhostItems();
    }
}

export default ItemDrag;
