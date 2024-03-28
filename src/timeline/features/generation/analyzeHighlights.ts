import { max, mean, min } from "lodash";

import {
    getChildren,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import type Highlight from "../../models/highlight/Highlight";
import type { Chord } from "../../models/item/Chord";
import isOverlapping from "../../../utils/interval/is_overlapping/isOverlapping";

import getHarmonyOfNotes from "./getHarmonyOfNotes";

export type NotesAnalysis = {
    noteCount: number;

    minPitch: number;
    maxPitch: number;
    meanPitch: number;
    medianPitch: number;

    minDuration: number;
    maxDuration: number;
    meanDuration: number;
    medianDuration: number;

    /* 
    minStart: number,
    maxStart: number,
    minEnd: number,
    maxEnd: number, 
    */

    harmony: Chord;
};

export default function analyzeHighlights(
    highlights: Highlight<any>[]
): NotesAnalysis | undefined {
    const noteHighlights = highlights.filter((highlight) => {
        return getParent(highlight).itemType === "NoteItem";
    }) as Highlight<"NoteItem">[];

    const notes = noteHighlights.flatMap((highlight) => {
        return getChildren(getParent(highlight)).filter((noteItem) => {
            return isOverlapping(noteItem.state, highlight.state);
        });
    });

    if (notes.length === 0) return;

    const pitches = notes.map((note) => note.state.content);
    const durations = notes.map((note) => note.state.end - note.state.start);

    return {
        noteCount: notes.length,

        minPitch: min(pitches)!,
        maxPitch: max(pitches)!,
        meanPitch: mean(pitches),
        medianPitch: findMedian(pitches)!,

        minDuration: min(durations)!,
        maxDuration: max(durations)!,
        meanDuration: mean(durations),
        medianDuration: findMedian(durations)!,

        harmony: getHarmonyOfNotes(notes)!,
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
