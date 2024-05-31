import { Chord, binarySearch } from "./Chord";

test("binarySearch", () => {
    const arr = [1, 3, 4, 7];
    expect(binarySearch(arr, 0)).toEqual([-1, false]); // Not in array
    expect(binarySearch(arr, 1)).toEqual([0, true]);
    expect(binarySearch(arr, 2)).toEqual([0, false]); // Not in array
    expect(binarySearch(arr, 3)).toEqual([1, true]);
    expect(binarySearch(arr, 4)).toEqual([2, true]);
    expect(binarySearch(arr, 5)).toEqual([2, false]); // Not in array
    expect(binarySearch(arr, 6)).toEqual([2, false]); // Not in array
    expect(binarySearch(arr, 7)).toEqual([3, true]);
    expect(binarySearch(arr, 8)).toEqual([3, false]); // Not in array
});

test("midiToDegree", () => {
    const chord = Chord.fromDecimal("C#", 1453);
    expect(isNaN(chord.midiToDegree(0))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(1))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(2))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(3))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(4))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(5))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(6))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(7))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(8))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(9))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(10))).toBeFalsy();
    expect(isNaN(chord.midiToDegree(11))).toBeFalsy();
});
