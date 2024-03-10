import type { ComponentType, SvelteComponent } from "svelte";

import type Item from "../models/Item";
import StringEditorWidget from "../visuals/editor_widgets/StringEditorWidget.svelte";
import ChordEditorWidget from "../visuals/editor_widgets/chord_editor_widget/ChordEditorWidget.svelte";

import { Chord } from "./chord/Chord";

export type ItemTypes = {
    StringItem: string;
    ChordItem: {
        chord?: Chord;
        filters: {
            chord: Chord;
            isUserRemovable: boolean;
            isDisabled: boolean;
        }[];
    };
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
    ChordItem: (value) => {
        if (value.chord) {
            return value.chord.getName();
        } else {
            return "Unfinished";
        }
    },
};

type StringConversionFunctions = {
    [K in keyof ItemTypes]: (value: ItemTypes[K]) => string;
};

export const initialContent: { [K in keyof ItemTypes]: () => ItemTypes[K] } = {
    StringItem: () => "",
    ChordItem: () => {
        return { filters: [] }; // obj should be a proxy such that changes to filters are reflected in chord
    },
};

export const postInitFunctions: Partial<{
    [K in keyof ItemTypes]: (item: Item<K>) => void;
}> = {
    ChordItem: (item) => {
        // Update filters based on specified scales
    },
};
