import type { UnsubscribeFn } from "../../../architecture/Stateful";
import {
    getChildren,
    getLastAncestor,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import isOverlapping from "../../../utils/interval/is_overlapping/isOverlapping";

import { Chord, ChordBuilder, createEmptyPitchMap } from "./Chord";
import type { PitchMap, Filter } from "./Chord";
import type Item from "./Item";

export type ItemTypes = {
    StringItem: string;
    ChordItem: {
        chordStatus: Chord | PitchMap;
        filters: Filter[];
    };
    NoteItem: number;
};

export const itemInitialContentFunctions: {
    [K in keyof ItemTypes]: () => ItemTypes[K];
} = {
    StringItem: () => "",
    ChordItem: () => {
        return { chordStatus: createEmptyPitchMap(), filters: [] };
    },
    NoteItem: () => Math.round(Math.random() * 12 + 36), // TEST
};

export const itemInitFunctions: Partial<{
    [K in keyof ItemTypes]: (item: Item<K>) => void;
}> = {
    ChordItem: (item) => {
        const timeline = getLastAncestor(item);

        if (getParent(item) === timeline.scaleTrack) return;

        // Update filters based on specified scales
        function updateFilters() {
            // CURRENTLY NOT HANDLING USER-SPECIFIED FILTERS CORRECTLY (THEY SHOULD NOT BE REMOVED)

            const overlappingScaleItems = getChildren(
                timeline.scaleTrack
            ).filter((scaleItem) => isOverlapping(item.state, scaleItem.state));

            const scales = overlappingScaleItems
                .map((scaleItem) => scaleItem.state.content.chordStatus)
                .filter(
                    (chordStatus): chordStatus is Chord =>
                        chordStatus instanceof Chord
                ); // The item must contain a finished chord

            const newFilters = scales.map((scale) => {
                return { chord: scale, isDisabled: false };
            });

            const builder = new ChordBuilder(item.state.content.chordStatus);

            builder.applyFilters(newFilters);

            item.state = {
                content: {
                    chordStatus: builder.build(),
                    filters: newFilters,
                },
            };
        }

        updateFilters(); // Initial update

        let prevStart = item.state.start;
        let prevEnd = item.state.end;

        item.subscribe(() => {
            // Update filters when the item has been moved
            if (item.state.start !== prevStart || item.state.end !== prevEnd) {
                // VERY IMPORTANT to set prevStart and prevEnd BEFORE calling updateFilters
                prevStart = item.state.start;
                prevEnd = item.state.end;
                updateFilters();
            }
        });

        const unsubscribeFuncs: UnsubscribeFn[] = [];

        timeline.scaleTrack.subscribe(() => {
            updateFilters(); // Update filters when a new item is added to the scale track

            unsubscribeFuncs.forEach((unsubscribe) => unsubscribe());
            unsubscribeFuncs.length = 0;

            getChildren(timeline.scaleTrack).forEach((scaleItem) => {
                unsubscribeFuncs.push(scaleItem.subscribe(updateFilters)); // Update filters when state of a scale item changes
            });
        });
    },
};
