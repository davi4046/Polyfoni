import type { ComponentType, SvelteComponent } from "svelte";

import type Item from "../models/Item";
import {
    getChildren,
    getGreatGreatGrandparent,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import isOverlapping from "../../../utils/interval/is_overlapping/isOverlapping";
import ChordEditorWidget from "../../user_interface/visuals/item_editors/chord_item_editor/ChordItemEditor.svelte";
import StringEditorWidget from "../../user_interface/visuals/item_editors/StringEditorWidget.svelte";
import {
    Chord,
    ChordBuilder,
    ChordItemContent,
    createEmptyPitchMap,
    type,
} from "./Chord";

import type { Subscription } from "../../../architecture/Stateful";
export type ItemTypes = {
    StringItem: string;
    ChordItem: ChordItemContent;
    NoteItem: number;
};

export const itemEditorWidgets: Partial<{
    [K in keyof ItemTypes]: EditorWidget<K>;
}> = {
    StringItem: StringEditorWidget,
    ChordItem: ChordEditorWidget,
};

type EditorWidget<T extends keyof ItemTypes> = ComponentType<
    SvelteComponent<
        {
            item: Item<T>;
        },
        {},
        {}
    >
>;

export const itemTextFunctions: {
    [K in keyof ItemTypes]: (value: ItemTypes[K]) => string;
} = {
    StringItem: (value) => value,
    ChordItem: (value) =>
        value.chordStatus instanceof Chord
            ? value.chordStatus.getName()
            : "undefined",
    NoteItem: (value) => String(value),
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

export const itemColorFunctions: Partial<{
    [K in keyof ItemTypes]: (content: ItemTypes[K]) => chroma.Color | undefined;
}> = {
    ChordItem: (content) => {
        if (content.chordStatus instanceof Chord) {
            return content.chordStatus.getColor();
        }
    },
};

export const itemInitFunctions: Partial<{
    [K in keyof ItemTypes]: (item: Item<K>) => void;
}> = {
    ChordItem: (item) => {
        const timeline = getGreatGreatGrandparent(item);

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

        const subscriptionHandles: Subscription<any>[] = [];

        timeline.scaleTrack.subscribe(() => {
            updateFilters(); // Update filters when a new item is added to the scale track

            subscriptionHandles.forEach((handle) => handle.unsubscribe());
            subscriptionHandles.length = 0; // Clear old handles

            getChildren(timeline.scaleTrack).forEach((scaleItem) => {
                subscriptionHandles.push(scaleItem.subscribe(updateFilters)); // Update filters when state of a scale item changes
            });
        });
    },
};
