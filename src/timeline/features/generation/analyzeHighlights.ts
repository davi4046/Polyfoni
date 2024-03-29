import { max, mean, min } from "lodash";

import type { Chord } from "../../models/item/Chord";
import type Item from "../../models/item/Item";

import getHarmonyOfNotes from "./getHarmonyOfNotes";

export type NotesAnalysis = {
    noteCount: number;

    minPitch: number;
    maxPitch: number;
    meanPitch: number;
    uniquePitches: number;

    meanDuration: number;

    harmony: Chord;
};

export default function analyzeNotes(
    notes: Item<"NoteItem">[]
): NotesAnalysis | undefined {
    if (notes.length === 0) return;

    const pitches = notes.map((note) => note.state.content);
    const durations = notes.map((note) => note.state.end - note.state.start);

    return {
        noteCount: notes.length,
        harmony: getHarmonyOfNotes(notes)!,

        minPitch: min(pitches)!,
        maxPitch: max(pitches)!,
        meanPitch: mean(pitches)!,
        uniquePitches: countUniqueValues(pitches)!,

        meanDuration: mean(durations)!,
    };
}

function findMedian(array: number[]): number | undefined {
    if (array.length === 0) return;

    array.sort((a, b) => a - b);

    const middleIndex = Math.floor(array.length / 2);

    if (array.length % 2 === 0) {
        return (array[middleIndex - 1] + array[middleIndex]) / 2;
    } else {
        return array[middleIndex];
    }
}

function countUniqueValues(numbers: number[]): number {
    return numbers.reduce(
        (count, num, index) =>
            numbers.indexOf(num) === index ? count + 1 : count,
        0
    );
}
