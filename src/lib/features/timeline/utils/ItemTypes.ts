import type { ComponentType, SvelteComponent } from "svelte";

import type Item from "../models/Item";
import StringEditorWidget from "../visuals/editor_widgets/StringEditorWidget.svelte";
import {
    getGreatGreatGrandparent,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import ChordEditorWidget from "../visuals/editor_widgets/chord_editor_widget/ChordEditorWidget.svelte";

import { ChordBuilder } from "./chord/Chord";

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
            item: Item<T>;
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

export const initialContent: { [K in keyof ItemTypes]: () => ItemTypes[K] } = {
    StringItem: () => "",
    ChordItem: () => {
        return new ChordBuilder();
    },
};

export const postInitFunctions: Partial<{
    [K in keyof ItemTypes]: (item: Item<K>) => void;
}> = {
    ChordItem: (item) => {
        const timeline = getGreatGreatGrandparent(item);

        if (
            getParent(item) === timeline.scaleTrack ||
            getParent(item) === timeline.totalTrack
        ) {
            return;
        }
    },
};
