import type Chord from "./Chord";

function getDecimal(this: Chord): number {
    return parseInt(this.getBinary(), 2);
}

export default getDecimal;
