import type { ComponentType, SvelteComponent } from "svelte";

import StringEditorWidget from "../visuals/other/editor_widgets/StringEditorWidget.svelte";
import ChordEditorWidget from "../visuals/other/editor_widgets/chord_editor_widget/ChordEditorWidget.svelte";

import type { Chord, ChordBuilder } from "./chord/Chord";

export type ItemTypes = {
    StringItem: string;
    ChordItem: { builder: ChordBuilder; filter: Chord | undefined };
};

export const editorWidgets: { [K in keyof ItemTypes]: EditorWidget<K> } = {
    StringItem: StringEditorWidget,
    ChordItem: ChordEditorWidget,
};

type EditorWidget<T extends keyof ItemTypes> = ComponentType<
    SvelteComponent<
        {
            value: ItemTypes[T];
            update: (value: ItemTypes[T]) => void;
        },
        {},
        {}
    >
>;

export const stringConversionFunctions: StringConversionFunctions = {
    StringItem: (value) => value,
    ChordItem: (value) => {
        if (value.builder.root && value.builder.decimal) {
            return `${value.builder.root}-${value.builder.decimal}`;
        } else {
            return "Unfinished";
        }
    },
};

type StringConversionFunctions = {
    [K in keyof ItemTypes]: (value: ItemTypes[K]) => string;
};
