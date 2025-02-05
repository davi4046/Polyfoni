import pitchNames from "../../utils/pitchNames";
import { Chord, type PitchMap } from "../../models/item/Chord";
import type Item from "../../models/item/Item";

export default function getHarmonyOfNotes(
    notes: Item<"NoteItem">[]
): Chord | undefined {
    notes = notes.filter((note) => note.state.content.type !== "Decoration");

    if (notes.length === 0) return;

    const rootMidiValue = notes.reduce((minPitch, note) => {
        return note.state.content.pitch < minPitch
            ? note.state.content.pitch
            : minPitch;
    }, Number.MAX_SAFE_INTEGER);

    const root = Object.values(pitchNames)[(rootMidiValue + 3) % 12];

    const pitches = Object.fromEntries(
        pitchNames.map((pitch) => {
            const midiValue = (pitchNames.indexOf(pitch) + 9) % 12;
            const isPresent = notes.some(
                (note) => note.state.content.pitch % 12 === midiValue
            );
            return [pitch, isPresent];
        })
    ) as PitchMap;

    return Chord.fromPitches(root, pitches);
}
