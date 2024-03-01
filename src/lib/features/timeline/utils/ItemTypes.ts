import type { ComponentType, SvelteComponent } from "svelte";

import ChordEditorWidget from "../visuals/views/_spawned/editor_widgets/ChordEditorWidget.svelte";
import StringEditorWidget from "../visuals/views/_spawned/editor_widgets/StringEditorWidget.svelte";

import pitchNames from "./pitchNames";

import Chord from "./chord/Chord";

export type ItemTypes = {
    StringItem: string;
    ChordItem: Chord;
};

export const editorWidgets: { [K in keyof ItemTypes]: EditorWidget<K> } = {
    StringItem: StringEditorWidget,
    ChordItem: ChordEditorWidget,
};

type EditorWidget<T extends keyof ItemTypes> = ComponentType<
    SvelteComponent<
        { value: ItemTypes[T]; update: (value: ItemTypes[T]) => void },
        {},
        {}
    >
>;

export const stringConversionFunctions: StringConversionFunctions = {
    StringItem: (value) => (value ? value : "empty"),
    ChordItem: (value) => {
        if (!value) return "empty";
        const root = pitchNames[value.pitchClassSet[0] % 12];
        const decimal = value.getDecimal();
        return root + "-" + decimal;
    },
};

type StringConversionFunctions = {
    [K in keyof ItemTypes]: (value: ItemTypes[K] | null) => string;
};
