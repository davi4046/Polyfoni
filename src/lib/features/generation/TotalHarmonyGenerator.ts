import type StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import {
    countAncestors,
    getChildren,
    getGrandparent,
    getGreatGrandparent,
    getIndex,
    getParent,
} from "../../architecture/state-hierarchy-utils";
import type { ItemState } from "../timeline/models/Item";
import Item from "../timeline/models/Item";
import type Timeline from "../timeline/models/Timeline";
import type Track from "../timeline/models/Track";
import pitchNames from "../timeline/utils/pitchNames";
import {
    trackIndexToType,
    trackTypeToIndex,
} from "../timeline/utils/track-config";
import type Interval from "../../utils/interval/Interval";
import { Chord, type PitchMap } from "../timeline/utils/chord/Chord";
import { intersectIntervals } from "../../utils/interval/intersect_intervals/intersectIntervals";
import isOverlapping from "../../utils/interval/is_overlapping/isOverlapping";

import compareArrays from "./compareArrays";

export default class TotalHarmonyGenerator {
    private _itemChanges: ItemChange[] = [];
    private _isHandlingChanges = false;

    private _totalHarmonyItems: Item<"ChordItem">[] = [];

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        watcher.subscribe((obj, oldState) => {
            const objDepth = countAncestors(obj);
            const newState = obj.state as any;

            switch (objDepth) {
                // Track
                case 3: {
                    const trackType = trackIndexToType(
                        getIndex(obj as Track<any>)
                    );
                    if (trackType !== "output" && trackType !== "harmony") {
                        return;
                    }

                    const { removedItems, addedItems } = compareArrays<
                        Item<any>
                    >(oldState.children, newState.children);

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
                case 4: {
                    const trackType = trackIndexToType(
                        getIndex(getParent(obj as Item<any>))
                    );
                    if (trackType !== "output" && trackType !== "harmony") {
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
                        watcher.root.totalTrack.state = {
                            children: this._totalHarmonyItems,
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
        const trackType = trackIndexToType(getIndex(itemState.parent));
        const voices = getChildren(getGrandparent(itemState.parent));
        const timeline = getGreatGrandparent(itemState.parent);

        const outputTracks: Track<"NoteItem">[] = voices.map(
            (voice) => getChildren(voice)[trackTypeToIndex("output")]
        );

        function getTotalHarmonyForInterval(interval: Interval): Chord {
            const notes = outputTracks.flatMap((track) => {
                return getChildren(track).filter((note) => {
                    return (
                        note.state.start >= interval.start &&
                        note.state.start < interval.end
                    );
                });
            });

            const rootMidiValue = notes.reduce((minPitch, note) => {
                return note.state.content < minPitch
                    ? note.state.content
                    : minPitch;
            }, Number.MAX_SAFE_INTEGER);

            const root = Object.values(pitchNames)[rootMidiValue % 12];

            const pitches = Object.fromEntries(
                pitchNames.map((pitch) => {
                    const midiValue = (pitchNames.indexOf(pitch) + 9) % 12;
                    const isPresent = notes.some(
                        (note) => note.state.content % 12 === midiValue
                    );
                    return [pitch, isPresent];
                })
            ) as PitchMap;

            return Chord.fromPitches(root, pitches);
        }

        switch (trackType) {
            case "output": {
                // update harmony for item that contain note start
                const item = this._totalHarmonyItems.find(
                    (item) =>
                        itemState.start >= item.state.start &&
                        itemState.start < item.state.end
                );

                if (!item) return;

                item.state.content.chordStatus = getTotalHarmonyForInterval(
                    item.state
                );

                break;
            }
            case "harmony": {
                const harmonyTracks: Track<"ChordItem">[] = voices.map(
                    (voice) => getChildren(voice)[trackTypeToIndex("harmony")]
                );

                const overlappedItems = harmonyTracks.flatMap((track) => {
                    return getChildren(track).filter((item) => {
                        return (
                            isOverlapping(item.state, itemState) &&
                            item.state.content.chordStatus instanceof Chord
                        );
                    });
                });

                const intervals = intersectIntervals(
                    overlappedItems.map((item) => item.state)
                );

                const newTotalHarmonyItems = intervals.map((interval) => {
                    return new Item("ChordItem", {
                        parent: timeline.totalTrack,
                        start: interval.start,
                        end: interval.end,
                        content: {
                            chordStatus: getTotalHarmonyForInterval(interval),
                            filters: [],
                        },
                    });
                });

                this._totalHarmonyItems = this._totalHarmonyItems.filter(
                    (item) => !isOverlapping(item.state, itemState)
                );

                this._totalHarmonyItems.push(...newTotalHarmonyItems);

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
