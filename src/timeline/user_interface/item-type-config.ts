import type { ComponentType, SvelteComponent } from "svelte";

import pitchNames from "../utils/pitchNames";
import { Chord } from "../models/item/Chord";
import type Item from "../models/item/Item";
import type { ItemTypes } from "../models/item/ItemTypes";

import ChordItemEditor from "./visuals/item_editors/chord_item_editor/ChordItemEditor.svelte";
import StringItemEditor from "./visuals/item_editors/string_item_editor/StringItemEditor.svelte";

export const itemTextFunctions: {
    [K in keyof ItemTypes]: (content: ItemTypes[K]) => string;
} = {
    StringItem: (content) => content,
    ChordItem: (content) =>
        content.chordStatus instanceof Chord
            ? content.chordStatus.getName()
            : "undefined",
    NoteItem: (content) => String(content),
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

export const itemTooltipContentFunctions: Partial<{
    [K in keyof ItemTypes]: (content: ItemTypes[K]) => string;
}> = {
    StringItem: (content) => content,
    ChordItem: (content) => {
        const chord = content.chordStatus;
        if (chord instanceof Chord) {
            const chordName = chord.getName();
            const primeName = chord.getPrimeForm().getName();
            const chordPitchNames = chord
                .getMidiValues()
                .map((midiValue) => pitchNames[(midiValue + 3) % 12]);

            return `
                    <div>${
                        chordName === primeName
                            ? `★ ${chordName}`
                            : `${chordName} (★ ${primeName})`
                    }</div>
                    <div>[${chordPitchNames.join(", ")}]</div>
                `;
        }
        return "";
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
