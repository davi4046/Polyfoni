import findModelById from "../../../shared/utils/find_model_by_id/findModelById";
import clamp from "../../../shared/utils/math_utils/clamp/clamp";
import Item from "../models/item/Item";
import Track from "../models/track/Track";
import offsetItems from "../utils/offset_items/offsetItems";

import type CursorContext from "./CursorContext";
import type SelectionContext from "./SelectionContext";

class MoveContext {
    private _items: Item[] = [];

    get items() {
        return this._items;
    }

    private _setItems(newItems: Item[]) {
        const oldTracks = this._items.map((item) => item.track);
        const newTracks = newItems.map((item) => item.track);
        const tracks = Array.from(new Set([...oldTracks, ...newTracks]));

        this._items = newItems;

        tracks.forEach((track) => track.notifySubscribers());
    }

    private _moveItems() {
        for (const item of this._items) {
            const originalItem = findModelById(
                item.track.voice.section,
                item.id
            ) as Item;

            originalItem.track.items = originalItem.track.items.filter(
                (item) => item !== originalItem
            );
            originalItem.track.notifySubscribers();
            item.track.items.push(originalItem);

            originalItem.start = item.start;
            originalItem.end = item.end;
            originalItem.track = item.track;
        }
    }

    constructor(
        private _selection: SelectionContext,
        private _cursor: CursorContext
    ) {
        let lastBeatOffset = 0;
        let lastTrackOffset = 0;
        let lastVoiceOffset = 0;

        this._cursor.subscribe((_) => {
            const clickedBeat = this._cursor.clickedBeat;
            const clickedTrack = this._cursor.clickedTrack;
            const hoveredBeat = this._cursor.hoveredBeat;
            const hoveredTrack = this._cursor.hoveredTrack;

            if (
                !clickedBeat ||
                !clickedTrack ||
                !hoveredBeat ||
                !hoveredTrack
            ) {
                this._moveItems();
                this._setItems([]);
                return;
            }

            const items = this._selection.selectedItems.map((item) => {
                return Object.assign({}, item);
            });

            const minBeat = items.reduce(
                (min, item) => Math.min(min, item.start),
                Number.MAX_VALUE
            );

            const beatOffset = Math.max(
                Math.round(hoveredBeat - clickedBeat),
                -minBeat
            );

            const clickedVoice = clickedTrack.voice;
            const hoveredVoice = hoveredTrack.voice;

            const clickedTrackIndex = clickedVoice.tracks.indexOf(clickedTrack);
            const hoveredTrackIndex = hoveredVoice.tracks.indexOf(hoveredTrack);

            const minTrackIndex = items.reduce((min, item) => {
                const index = item.track.voice.tracks.indexOf(item.track);
                return Math.min(min, index);
            }, Number.MAX_VALUE);

            const maxTrackIndex = items.reduce((max, item) => {
                const index = item.track.voice.tracks.indexOf(item.track);
                return Math.max(max, index);
            }, Number.MIN_VALUE);

            const trackOffset = clamp(
                hoveredTrackIndex - clickedTrackIndex,
                -minTrackIndex,
                4 - maxTrackIndex
            );

            const clickedVoiceIndex =
                clickedVoice.section.voices.indexOf(clickedVoice);
            const hoveredVoiceIndex =
                hoveredVoice.section.voices.indexOf(hoveredVoice);

            const minVoiceIndex = items.reduce((min, item) => {
                const index = item.track.voice.section.voices.indexOf(
                    item.track.voice
                );
                return Math.min(min, index);
            }, Number.MAX_VALUE);

            const maxVoiceIndex = items.reduce((max, item) => {
                const index = item.track.voice.section.voices.indexOf(
                    item.track.voice
                );
                return Math.max(max, index);
            }, Number.MIN_VALUE);

            const voiceCount = items[0].track.voice.section.voices.length;

            const voiceOffset = clamp(
                hoveredVoiceIndex - clickedVoiceIndex,
                -minVoiceIndex,
                voiceCount - maxVoiceIndex - 1
            );

            if (
                beatOffset === lastBeatOffset &&
                trackOffset === lastTrackOffset &&
                voiceOffset === lastVoiceOffset
            ) {
                return;
            }

            lastBeatOffset = beatOffset;
            lastTrackOffset = trackOffset;
            lastVoiceOffset = voiceOffset;

            if (beatOffset === 0 && trackOffset === 0 && voiceOffset === 0) {
                this._setItems([]);
                return;
            }

            offsetItems(items, beatOffset, trackOffset, voiceOffset);
            this._setItems(items);
        });
    }
}

export default MoveContext;
