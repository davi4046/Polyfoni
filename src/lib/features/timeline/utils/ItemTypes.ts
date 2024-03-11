import type { ComponentType, SvelteComponent } from "svelte";

import type Item from "../models/Item";
import StringEditorWidget from "../visuals/editor_widgets/StringEditorWidget.svelte";
import {
    getChildren,
    getGreatGreatGrandparent,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import ChordEditorWidget from "../visuals/editor_widgets/chord_editor_widget/ChordEditorWidget.svelte";
import isOverlapping from "../../../utils/interval/is_overlapping/isOverlapping";

import { Chord, ChordBuilder, type ChordItemContent } from "./chord/Chord";

export type ItemTypes = {
    StringItem: string;
    ChordItem: ChordItemContent;
};

export const editorWidgets: { [K in keyof ItemTypes]: EditorWidget<K> } = {
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

export const stringConversionFunctions: StringConversionFunctions = {
    StringItem: (value) => value,
    ChordItem: (value) => value.chord.getName(),
};

type StringConversionFunctions = {
    [K in keyof ItemTypes]: (value: ItemTypes[K]) => string;
};

export const initialContent: { [K in keyof ItemTypes]: () => ItemTypes[K] } = {
    StringItem: () => "",
    ChordItem: () => {
        return { chord: new Chord(), filters: [] };
    },
};

export const postInitFunctions: Partial<{
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
                .map((scaleItem) => scaleItem.state.content.chord)
                .filter(
                    (chord): chord is Required<Chord> =>
                        chord.root !== undefined && chord.decimal !== undefined
                ); // Scale must be specified

            const newFilters = scales.map((scale) => {
                return { chord: scale, isDisabled: false };
            });

            const builder = new ChordBuilder(item.state.content.chord);

            builder.applyFilters(newFilters);

            item.state = {
                content: {
                    chord: new Chord(builder.root, builder.decimal),
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

        let unsubscribers: (() => void)[] = [];

        timeline.scaleTrack.subscribe(() => {
            updateFilters(); // Update filters when a new item is added to the scale track

            unsubscribers.forEach((unsubscribe) => unsubscribe());
            unsubscribers = [];

            getChildren(timeline.scaleTrack).forEach((scaleItem) => {
                unsubscribers.push(scaleItem.subscribe(updateFilters)); // Update filters when state of a scale item changes
            });
        });
    },
};
