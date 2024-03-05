import type { ComponentType, SvelteComponent } from "svelte";

import StringEditorWidget from "../visuals/other/editor_widgets/StringEditorWidget.svelte";
import ChordEditorWidget from "../visuals/other/editor_widgets/chord_editor_widget/ChordEditorWidget.svelte";

import type { ChordBuilder } from "./chord/ChordBuilder";

export type ItemTypes = {
    StringItem: string;
    ChordItem: ChordBuilder;
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
        if (value.root && value.decimal) {
            return `${value.root}-${value.decimal}`;
        } else {
            return "Unfinished";
        }
    },
};

type StringConversionFunctions = {
    [K in keyof ItemTypes]: (value: ItemTypes[K]) => string;
};
