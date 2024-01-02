import type Chord from "./Chord";

function getBinary(this: Chord): string {
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

export default getBinary;
