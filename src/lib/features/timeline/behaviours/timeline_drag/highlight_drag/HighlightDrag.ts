import TimelineDrag from "../TimelineDrag";

import type Track from "../../../models/track/Track";

class HighlightDrag extends TimelineDrag {
    protected handleDrag(
        fromBeat: number,
        toBeat: number,
        fromTrack: Track,
        toTrack: Track
    ): void {
        console.log("highlight drag");
    }

    protected handleDrop(): void {}
}

export default HighlightDrag;
