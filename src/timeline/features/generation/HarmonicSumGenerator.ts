import { isEqual } from "lodash";

import StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import {
    countAncestors,
    getChildren,
    getGreatGrandparent,
    getIndex,
    getLastAncestor,
    getParent,
    getPosition,
    isPositionOnPath,
} from "../../../architecture/state-hierarchy-utils";
import compareArrays from "../../../utils/compareArrays";
import { Chord, createEmptyPitchMap } from "../../models/item/Chord";
import type { ItemState } from "../../models/item/Item";
import Item from "../../models/item/Item";
import type { ItemTypes } from "../../models/item/ItemTypes";
import type Timeline from "../../models/timeline/Timeline";
import type Track from "../../models/track/Track";
import type Interval from "../../../utils/interval/Interval";
import { intersectIntervals } from "../../../utils/interval/intersect_intervals/intersectIntervals";
import isOverlapping from "../../../utils/interval/is_overlapping/isOverlapping";

import getHarmonyOfNotes from "./getHarmonyOfNotes";
import { getTrackType, getTracksOfType } from "./track-config";

export default class HarmonicSumGenerator {
    private _itemChanges: ItemChange[] = [];
    private _isHandlingChanges = false;

    private _totalHarmonyItems: Item<"ChordItem">[] = [];

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        watcher.subscribe((obj, oldState) => {
            const timeline = watcher.root;
            const position = getPosition(obj);
            const newState = obj.state as any;

            if (!isPositionOnPath(position, "1")) return; // Return if object not in second VoiceGroup

            switch (position.length) {
                // Track
                case 4: {
                    const trackType = getTrackType(obj as Track<any>);
                    if (
                        !trackType ||
                        (trackType !== "output" &&
                            trackType !== "frameworkHarmony")
                    ) {
                        return;
                    }

                    const [removedItems, addedItems] = compareArrays<Item<any>>(
                        oldState.children,
                        newState.children
                    );

                    this._itemChanges.push(
                        ...removedItems.map((item) => {
                            return {
                                oldState: item.state,
                                newState: undefined,
                            };
                        }),
                        ...addedItems.map((item) => {
                            return {
                                oldState: undefined,
                                newState: item.state,
                            };
                        })
                    );
                    break;
                }
                // Item
                case 5: {
                    const trackType = getTrackType(getParent(obj as Item<any>));
                    if (
                        !trackType ||
                        (trackType !== "output" &&
                            trackType !== "frameworkHarmony")
                    ) {
                        return;
                    }

                    this._itemChanges.push({ oldState, newState });
                    break;
                }
            }

            if (this._itemChanges.length > 0 && !this._isHandlingChanges) {
                const handleNextChangeLoop = () => {
                    let nextChange = this._itemChanges.shift();

                    if (nextChange) {
                        this._handleChange(nextChange).then(
                            handleNextChangeLoop
                        );
                    } else {
                        this._isHandlingChanges = false;
                        // render output
                        const filteredItems = this._totalHarmonyItems.filter(
                            (item) =>
                                item.state.content.chordStatus instanceof Chord
                        );
                        const mergedItems = mergeAdjacentItemsByContent(
                            "ChordItem",
                            filteredItems
                        );
                        timeline.totalTrack.state = {
                            children: mergedItems,
                        };
                    }
                };
                this._isHandlingChanges = true;
                handleNextChangeLoop();
            }
        });
    }

    private async _handleChange(change: ItemChange) {
        if (change.oldState) this._updateItemStateEffect(change.oldState);
        if (change.newState) this._updateItemStateEffect(change.newState);
    }

    private async _updateItemStateEffect(itemState: ItemState<any>) {
        const trackType = getTrackType(itemState.parent);
        const voices = getChildren(getGreatGrandparent(itemState.parent));
        const timeline = getLastAncestor(itemState.parent);

        const outputTracks = voices.map(
            (voice) => getTracksOfType(voice, "output")[0]
        );

        function getTotalHarmonyForInterval(
            interval: Interval
        ): Chord | undefined {
            const notes = outputTracks.flatMap((track) => {
                return getChildren(track).filter((note) => {
                    return isOverlapping(note.state, interval);
                });
            });
            return getHarmonyOfNotes(notes);
        }

        switch (trackType) {
            case "output": {
                // update harmony for items that overlap the note
                const items = this._totalHarmonyItems.filter((item) =>
                    isOverlapping(item.state, itemState)
                );

                items.forEach((item) => {
                    const totalChord = getTotalHarmonyForInterval(item.state);
                    item.state = {
                        content: {
                            chordStatus: totalChord
                                ? totalChord
                                : createEmptyPitchMap(),
                            filters: [],
                        },
                    };
                });
                break;
            }
            case "frameworkHarmony": {
                const harmonyTracks = voices.map(
                    (voice) => getTracksOfType(voice, "frameworkHarmony")[0]
                );

                const harmonyItems = harmonyTracks.flatMap(getChildren);

                const intervals = intersectIntervals(
                    harmonyItems.map((item) => item.state)
                );

                const newTotalHarmonyItems = intervals.map((interval) => {
                    const item = this._totalHarmonyItems.find(
                        (item) => item.state.start === interval.start
                    );

                    const totalChord =
                        item?.state.end === interval.end
                            ? item.state.content.chordStatus
                            : getTotalHarmonyForInterval(interval);

                    return new Item("ChordItem", {
                        parent: timeline.totalTrack,
                        start: interval.start,
                        end: interval.end,
                        content: {
                            chordStatus: totalChord
                                ? totalChord
                                : createEmptyPitchMap(),
                            filters: [],
                        },
                    });
                });
                this._totalHarmonyItems = newTotalHarmonyItems;
                break;
            }
        }
    }
}

type StateChange<TState> = {
    oldState: TState;
    newState: TState;
};

type ItemChange = StateChange<ItemState<any> | undefined>;

function mergeAdjacentItemsByContent<T extends keyof ItemTypes>(
    itemType: T,
    items: Item<T>[]
): Item<T>[] {
    if (items.length <= 1) return items;

    const mergedItems: Item<T>[] = [];
    let currItem: Item<T> = new Item(itemType, {
        ...items[0].state,
    });

    for (let i = 1; i < items.length; i++) {
        const nextItem = new Item(itemType, {
            ...items[i].state,
        });
        if (isEqual(currItem.state.content, nextItem.state.content)) {
            currItem.state = {
                end: nextItem.state.end,
            };
        } else {
            mergedItems.push(currItem);
            currItem = nextItem;
        }
    }
    mergedItems.push(currItem);
    return mergedItems;
}
