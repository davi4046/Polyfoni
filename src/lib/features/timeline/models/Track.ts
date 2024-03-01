import type { ItemTypes } from "../utils/ItemTypes";
import Model from "../../../shared/architecture/model/Model";
import type ParentChildState from "../../../shared/architecture/state/ParentChildState";
import {
    addChildren,
    getChildren,
    getGrandparent,
    getGreatGrandparent,
    getIndex,
    getParent,
    getPosition,
    isGreaterPos,
    removeChildren,
} from "../../../shared/architecture/state/state_utils";
import clearInterval from "../../../shared/utils/interval/clear_interval/clearInterval";

import Item from "./Item";
import type Voice from "./Voice";

interface TrackState<T extends keyof ItemTypes>
    extends ParentChildState<Voice, Item<T>> {
    label: string;
}

export default class Track<T extends keyof ItemTypes> extends Model<
    TrackState<T>
> {
    constructor(
        readonly itemType: T,
        state: TrackState<T>
    ) {
        super(state);
    }

    cropItemsByInterval(
        start: number,
        end: number,
        itemsToIgnore: Item<T>[] = []
    ) {
        const intervals = getChildren(this).map((item) => {
            return {
                start: item.state.start,
                end: item.state.end,
                item: item,
            };
        });

        clearInterval(intervals, { start, end });

        const alreadyUpdated: Item<T>[] = [];
        const newItems: Item<T>[] = [];

        for (const interval of intervals) {
            if (itemsToIgnore.includes(interval.item)) continue;

            if (alreadyUpdated.includes(interval.item)) {
                // Item has appeared as interval data before, meaning its interval has been split.
                // We therefore make a new item for the split part.
                const newItem = new Item(
                    interval.item.itemType,
                    interval.item.state
                );
                newItem.state = {
                    start: interval.start,
                    end: interval.end,
                };
                newItems.push(newItem);
            } else {
                interval.item.state = {
                    start: interval.start,
                    end: interval.end,
                };
                alreadyUpdated.push(interval.item);
            }
        }

        for (const item of getChildren(this)) {
            if (alreadyUpdated.includes(item) || itemsToIgnore.includes(item)) {
                continue;
            }
            // The item's interval has been removed. We therefore remove the item.
            removeChildren(this, item);
        }

        addChildren(this, ...newItems);
    }

    static getTracksInRange(
        startTrack: Track<any>,
        endTrack: Track<any>
    ): Track<any>[] {
        const timeline = getGreatGrandparent(startTrack);

        if (getGreatGrandparent(endTrack) !== timeline) {
            throw new Error(
                "startTrack and endTrack must reference the same Timeline as parent"
            );
        }

        const startPos = getPosition(startTrack);
        const endPos = getPosition(endTrack);

        const isStartTrackFirst = isGreaterPos(endPos, startPos);

        const minTrack = isStartTrackFirst ? startTrack : endTrack;
        const maxTrack = isStartTrackFirst ? endTrack : startTrack;

        const minVoice = getParent(minTrack);
        const maxVoice = getParent(maxTrack);

        const minSection = getGrandparent(minTrack);
        const maxSection = getGrandparent(maxTrack);

        const sections = timeline.state.children.slice(
            getIndex(minSection),
            getIndex(maxSection) + 1
        );

        const voices = sections.flatMap((section) => {
            const start =
                section === minSection ? getIndex(minVoice) : undefined;
            const end =
                section === maxSection ? getIndex(maxVoice) + 1 : undefined;
            return section.state.children.slice(start, end);
        });

        const tracks = voices.flatMap((voice) => {
            const start = voice === minVoice ? getIndex(minTrack) : undefined;
            const end = voice === maxVoice ? getIndex(maxTrack) + 1 : undefined;
            return voice.state.children.slice(start, end);
        });

        return tracks;
    }
}
