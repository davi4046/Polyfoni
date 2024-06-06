import { BASE_OCTAVE, Chord } from "./Chord";

test("midiToDegree 1", () => {
    const chord = Chord.fromDecimal("C#", 1453);
    // midi values: 1, 3, 4, 6, 8, 9, 11
    // degrees:     0  1  2  3  4  5  6

    const OFFSET = BASE_OCTAVE * 12;

    expect(chord.midiToDegree(0 + OFFSET)).toEqual(-0.5);
    expect(chord.midiToDegree(1 + OFFSET)).toEqual(0);
    expect(chord.midiToDegree(2 + OFFSET)).toEqual(0.5);
    expect(chord.midiToDegree(3 + OFFSET)).toEqual(1);
    expect(chord.midiToDegree(4 + OFFSET)).toEqual(2);
    expect(chord.midiToDegree(5 + OFFSET)).toEqual(2.5);
    expect(chord.midiToDegree(6 + OFFSET)).toEqual(3);
    expect(chord.midiToDegree(7 + OFFSET)).toEqual(3.5);
    expect(chord.midiToDegree(8 + OFFSET)).toEqual(4);
    expect(chord.midiToDegree(9 + OFFSET)).toEqual(5);
    expect(chord.midiToDegree(10 + OFFSET)).toEqual(5.5);
    expect(chord.midiToDegree(11 + OFFSET)).toEqual(6);
});

test("midiToDegree 2", () => {
    const chord = Chord.fromDecimal("B", 73);
    // midi values:  -1, 2, 5
    // degrees:       0, 1, 2

    const OFFSET = BASE_OCTAVE * 12;

    expect(chord.midiToDegree(-1 + OFFSET)).toEqual(0);
    expect(chord.midiToDegree(0 + OFFSET)).toEqual(1 / 3);
    expect(chord.midiToDegree(1 + OFFSET)).toEqual(2 / 3);
    expect(chord.midiToDegree(2 + OFFSET)).toEqual(1);
    expect(chord.midiToDegree(3 + OFFSET)).toEqual(1 + 1 / 3);
    expect(chord.midiToDegree(4 + OFFSET)).toEqual(1 + 2 / 3);
    expect(chord.midiToDegree(5 + OFFSET)).toEqual(2);
    expect(chord.midiToDegree(6 + OFFSET)).toEqual(2 + 1 / 6);
    expect(chord.midiToDegree(7 + OFFSET)).toEqual(2 + 2 / 6);
    expect(chord.midiToDegree(8 + OFFSET)).toEqual(2 + 3 / 6);
    expect(chord.midiToDegree(9 + OFFSET)).toEqual(2 + 4 / 6);
    expect(chord.midiToDegree(10 + OFFSET)).toEqual(2 + 5 / 6);
    expect(chord.midiToDegree(11 + OFFSET)).toEqual(3);
});

test("midiToDegree 3", () => {
    const chord = Chord.fromDecimal("A", 2477);
    console.log(chord.getMidiValues());
    // midi values: -3, -1, 0, 2, 4, 5, 8
    // degrees:      0,  1, 2, 3, 4, 5, 6

    const OFFSET = BASE_OCTAVE * 12;

    expect(chord.midiToDegree(-3 + OFFSET)).toEqual(0);
    expect(chord.midiToDegree(-2 + OFFSET)).toEqual(0.5);
    expect(chord.midiToDegree(-1 + OFFSET)).toEqual(1);
    expect(chord.midiToDegree(0 + OFFSET)).toEqual(2);
    expect(chord.midiToDegree(1 + OFFSET)).toEqual(2.5);
    expect(chord.midiToDegree(2 + OFFSET)).toEqual(3);
    expect(chord.midiToDegree(3 + OFFSET)).toEqual(3.5);
    expect(chord.midiToDegree(4 + OFFSET)).toEqual(4);
    expect(chord.midiToDegree(5 + OFFSET)).toEqual(5);
    expect(chord.midiToDegree(6 + OFFSET)).toEqual(5 + 1 / 3);
    expect(chord.midiToDegree(7 + OFFSET)).toEqual(5 + 2 / 3);
    expect(chord.midiToDegree(8 + OFFSET)).toEqual(6);
});
