import { Chord, createEmptyPitchMap } from "./Chord";
import type { PitchMap, Filter } from "./Chord";

export type ItemTypes = {
    StringItem: string;
    ChordItem: {
        chordStatus: Chord | PitchMap;
        filters: Filter[];
    };
    NoteItem: {
        pitch: number;
        type: "Framework" | "Decoration";
    };
};

export const itemInitialContentFunctions: {
    [K in keyof ItemTypes]: () => ItemTypes[K];
} = {
    StringItem: () => "",
    ChordItem: () => {
        return { chordStatus: createEmptyPitchMap(), filters: [] };
    },
    NoteItem: () => {
        return {
            pitch: Math.round(Math.random() * 12 + 36),
            type: "Framework",
        };
    }, // TEST
};
