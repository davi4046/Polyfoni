import { clamp } from "lodash";

import type { ItemTypes } from "./../utils/ItemTypes";
import Model from "../../../shared/architecture/model/Model";
import {
    type ChildState,
    getChildren,
    getGrandparent,
    getGreatGrandparent,
    getIndex,
    getParent,
} from "../../../shared/architecture/state/state_utils";

import type Track from "./Track";

interface ItemState<T extends keyof ItemTypes> extends ChildState<Track<T>> {
    start: number;
    end: number;
    content: ItemTypes[T];
}

class Item<T extends keyof ItemTypes> extends Model<ItemState<T>> {
    constructor(
        readonly itemType: T,
        state: ItemState<T>
    ) {
        super(state);
    }

    static offsetBunchOfItems(
        items: Item<any>[],
        beatOffset: number,
        trackOffset: number,
        voiceOffset: number
    ): Item<any>[] {
        const section = getGreatGrandparent(items[0]);

        items.forEach((item) => {
            if (getGreatGrandparent(item) !== section) {
                throw new Error(
                    "Failed to offset items, all items' voices must reference the same section"
                );
            }
        });

        /* Clamp Beat Offset */

        const minBeat = items.reduce(
            (min, item) => Math.min(min, item.state.start),
            Number.MAX_VALUE
        );

        beatOffset = Math.max(beatOffset, -minBeat);

        /* Clamp Track Offset */

        const minTrackIndex = items.reduce((min, item) => {
            const index = getIndex(getParent(item));
            return Math.min(min, index);
        }, Number.MAX_VALUE);

        const maxTrackIndex = items.reduce((max, item) => {
            const index = getIndex(getParent(item));
            return Math.max(max, index);
        }, Number.MIN_VALUE);

        trackOffset = clamp(trackOffset, -minTrackIndex, 4 - maxTrackIndex);

        /* Clamp Voice Offset  */

        const minVoiceIndex = items.reduce((min, item) => {
            const index = getIndex(getGrandparent(item));
            return Math.min(min, index);
        }, Number.MAX_VALUE);

        const maxVoiceIndex = items.reduce((max, item) => {
            const index = getIndex(getGrandparent(item));
            return Math.max(max, index);
        }, Number.MIN_VALUE);

        const voiceCount = getChildren(section).length;

        voiceOffset = clamp(
            voiceOffset,
            -minVoiceIndex,
            voiceCount - maxVoiceIndex - 1
        );

        /* Offset Items */

        return items.map((item) => {
            const newStart = item.state.start + beatOffset;
            const newEnd = newStart + item.state.end - item.state.start;

            const trackIndex = getIndex(getParent(item));
            const voiceIndex = getIndex(getGrandparent(item));

            const newTrackIndex = trackIndex + trackOffset;
            const newVoiceIndex = voiceIndex + voiceOffset;

            const newTrack = getChildren(
                getChildren(getGreatGrandparent(item))[newVoiceIndex]
            )[newTrackIndex];

            return new Item(newTrack.itemType, {
                parent: newTrack,
                start: newStart,
                end: newEnd,
                content: null,
            });
        });
    }
}

export default Item;
