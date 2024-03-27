import type { ComponentType, SvelteComponent } from "svelte";

import { Chord } from "../models/item/Chord";
import type Item from "../models/item/Item";
import type { ItemTypes } from "../models/item/ItemTypes";

import ChordItemEditor from "./visuals/item_editors/chord_item_editor/ChordItemEditor.svelte";
import StringItemEditor from "./visuals/item_editors/string_item_editor/StringItemEditor.svelte";

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

export const itemColorFunctions: Partial<{
    [K in keyof ItemTypes]: (content: ItemTypes[K]) => chroma.Color | undefined;
}> = {
    ChordItem: (content) => {
        if (content.chordStatus instanceof Chord) {
            return content.chordStatus.getColor();
        }
    },
};

export const itemEditors: Partial<{
    [K in keyof ItemTypes]: EditorWidget<K>;
}> = {
    StringItem: StringItemEditor,
    ChordItem: ChordItemEditor,
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
