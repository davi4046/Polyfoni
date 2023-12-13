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
        const ghostPairs = this.context.selection.selectedItems.map((item) => {
            return [item, new Item(() => item.state)] as [
                legit: Item,
                ghost: Item,
            ];
        });

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

    protected handleReset() {
        this.context.move.ghostPairs = [];
    }
}

export default ItemDrag;
