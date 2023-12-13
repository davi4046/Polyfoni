import type Track from "../../../models/track/Track";
import TimelineDrag from "../TimelineDrag";

class ItemDrag extends TimelineDrag {
    protected handleDrag(
        fromBeat: number,
        toBeat: number,
        fromTrack: Track,
        toTrack: Track
    ) {
        console.log("item dragged");
    }

    protected handleDrop() {}
}

export default ItemDrag;
