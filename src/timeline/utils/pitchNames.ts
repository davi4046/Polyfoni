const pitchNames = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
] as const;

export default pitchNames;

export function getPitchName(pitch: number) {
    const pitchIndex = (pitch + 3) % 12;
    const pitchName = Object.values(pitchNames)[pitchIndex];
    return pitchName;
}
export function getPitchOctave(pitch: number): number {
    return Math.floor(pitch / 12) - 1;
}
