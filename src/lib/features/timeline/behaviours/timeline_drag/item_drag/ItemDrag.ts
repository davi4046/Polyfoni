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
        const ghostItems = this.context.selection.selectedItems.map(
            (item) => new Item(() => item.state)
        );

        /* Calculate Beat Offset */

        const beatOffset = toBeat - fromBeat;

        /* Calculate Track Offset */

        const fromVoice = fromTrack.state.voice;
        const toVoice = toTrack.state.voice;

        const fromTrackIndex = fromVoice.state.tracks.indexOf(fromTrack);
        const toTrackIndex = toVoice.state.tracks.indexOf(toTrack);

        const trackOffset = toTrackIndex - fromTrackIndex;

        /* Calculate Voice Offset */

        const fromVoiceIndex =
            fromVoice.state.section.state.voices.indexOf(fromVoice);

        const toVoiceIndex =
            toVoice.state.section.state.voices.indexOf(toVoice);

        const voiceOffset = toVoiceIndex - fromVoiceIndex;

        /* Offset Items */

        offsetItems(ghostItems, beatOffset, trackOffset, voiceOffset);

        this.context.move.ghostItems = ghostItems;

        console.log("item dragged");
    }

    protected handleDrop() {
        this.context.move.ghostItems = [];
    }

    protected handleReset() {
        this.context.move.ghostItems = [];
    }
}

export default ItemDrag;
