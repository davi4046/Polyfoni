import degreeToPitch from "./degreeToPitch";
import getBinary from "./getBinary";
import getDecimal from "./getDecimal";

class Chord {
    readonly pitchClassSet: number[];

    constructor(pitches: number[]) {
        this.pitchClassSet = Array.from(new Set(pitches));
    }

    degreeToPitch = degreeToPitch;
    getBinary = getBinary;
    getDecimal = getDecimal;
}

export default Chord;
