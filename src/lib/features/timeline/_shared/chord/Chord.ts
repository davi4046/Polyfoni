export default class Chord {
    readonly pitchClassSet: number[];

    constructor(pitches: number[]) {
        this.pitchClassSet = Array.from(new Set(pitches));
    }

    degreeToPitch(degree: number): number {
        let octave = Math.floor(degree / this.pitchClassSet.length) + 4;
        let index = degree % this.pitchClassSet.length;
        while (index < 0) index += this.pitchClassSet.length;
        return this.pitchClassSet[index] + 12 * octave;
    }

    getBinary(this: Chord): string {
        let root = this.pitchClassSet[0] % 12;

        let binary = Array(12).fill("0");

        this.pitchClassSet.forEach((pitchClass) => {
            let index = pitchClass - root;

            while (index >= 12) index -= 12;
            while (index < 0) index += 12;

            binary[11 - index] = "1";
        });

        return binary.join("");
    }

    getDecimal(this: Chord): number {
        return parseInt(this.getBinary(), 2);
    }
}
