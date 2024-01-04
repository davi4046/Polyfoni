import type Chord from "./Chord";

function degreeToPitch(this: Chord, degree: number): number {
    let octave = Math.floor(degree / this.pitchClassSet.length) + 4;
    let index = degree % this.pitchClassSet.length;
    while (index < 0) index += this.pitchClassSet.length;
    return this.pitchClassSet[index] + 12 * octave;
}

export default degreeToPitch;
