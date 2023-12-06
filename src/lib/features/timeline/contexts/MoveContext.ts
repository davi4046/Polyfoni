import clamp from "../../../shared/utils/math_utils/clamp/clamp";
import offsetItems from "../utils/offset_items/offsetItems";

import type CursorContext from "./CursorContext";
import type SelectionContext from "./SelectionContext";

class MoveContext {
    constructor(
        private _selection: SelectionContext,
        private _cursor: CursorContext
    ) {
        this._cursor.subscribe((_) => {
            const clickedBeat = this._cursor.clickedBeat;
            const clickedTrack = this._cursor.clickedTrack;
            const hoveredBeat = this._cursor.hoveredBeat;
            const hoveredTrack = this._cursor.hoveredTrack;

            if (clickedBeat && clickedTrack && hoveredBeat && hoveredTrack) {
                const items = this._selection.selectedItems.map((item) => {
                    return Object.assign({}, item);
                });

                const minBeat = items.reduce(
                    (min, item) => Math.min(min, item.start),
                    Number.MAX_VALUE
                );

                const beatOffset = Math.max(
                    hoveredBeat - clickedBeat,
                    -minBeat
                );

                const clickedVoice = clickedTrack.voice;
                const hoveredVoice = hoveredTrack.voice;

                if (!clickedVoice || !hoveredVoice) {
                    throw new Error(
                        "clickedVoice or hoveredVoice is non-existent"
                    );
                }

                const clickedTrackIndex =
                    clickedVoice.tracks.indexOf(clickedTrack);

                const hoveredTrackIndex =
                    hoveredVoice.tracks.indexOf(hoveredTrack);

                const minTrackIndex = items.reduce((min, item) => {
                    const index = item.track.voice!.tracks.indexOf(item.track);
                    return Math.min(min, index);
                }, Number.MAX_VALUE);

                const maxTrackIndex = items.reduce((max, item) => {
                    const index = item.track.voice!.tracks.indexOf(item.track);
                    return Math.max(max, index);
                }, Number.MIN_VALUE);

                const trackOffset = clamp(
                    hoveredTrackIndex - clickedTrackIndex,
                    -minTrackIndex,
                    5 - maxTrackIndex
                );

                const clickedVoiceIndex =
                    clickedVoice.section.voices.indexOf(clickedVoice);
                const hoveredVoiceIndex =
                    hoveredVoice.section.voices.indexOf(hoveredVoice);

                const minVoiceIndex = items.reduce((min, item) => {
                    const index = item.track.voice!.section.voices.indexOf(
                        item.track.voice!
                    );
                    return Math.min(min, index);
                }, Number.MAX_VALUE);

                const maxVoiceIndex = items.reduce((max, item) => {
                    const index = item.track.voice!.section.voices.indexOf(
                        item.track.voice!
                    );
                    return Math.max(max, index);
                }, Number.MIN_VALUE);

                const voiceCount = items[0].track.voice!.section.voices.length;

                const voiceOffset = clamp(
                    hoveredVoiceIndex - clickedVoiceIndex,
                    -minVoiceIndex,
                    voiceCount - maxVoiceIndex - 1
                );

                console.log("trackOffset:", trackOffset);
                console.log("voiceOffset:", voiceOffset);

                offsetItems(items, beatOffset, trackOffset, voiceOffset);

                console.log("moved items:", items);
            } else {
                //remove item moves
            }
        });
    }
}

export default MoveContext;
