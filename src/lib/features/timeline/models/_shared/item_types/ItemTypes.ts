import type { ComponentType, SvelteComponent } from "svelte";

import pitchNames from '../../../utils/pitchNames';
import Chord from '../../../utils/chord/Chord';
import ChordEditorWidget from '../../../views/_spawned/editor_widgets/ChordEditorWidget.svelte';
import StringEditorWidget from '../../../views/_spawned/editor_widgets/StringEditorWidget.svelte';

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

export const toStringFunctions: ToStringFunctions = {
    StringItem: (value) => (value ? value : "empty"),
    ChordItem: (value) => {
        if (!value) return "empty";
        const root = pitchNames[value.pitchClassSet[0] % 12];
        const decimal = value.getDecimal();
        return root + "-" + decimal;
    },
};

type ToStringFunctions = {
    [K in keyof ItemTypes]: (value: ItemTypes[K] | null) => string;
};


