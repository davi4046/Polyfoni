import chroma from "chroma-js";

import pitchNames from "../../utils/pitchNames";
import {
    circWrap,
    circClosestIndex,
    minCircDist,
} from "../../../utils/math-utils";

export const BASE_OCTAVE = 5;

export type Pitch = (typeof pitchNames)[number];
export type PitchMap = { [K in Pitch]: boolean };

export type Filter = { chord: Chord; isDisabled: boolean };

export function createEmptyPitchMap(): PitchMap {
    return Object.fromEntries(
        pitchNames.map((pitch) => [pitch, false])
    ) as PitchMap;
}

export class Chord {
    constructor(
        public root: Pitch,
        public decimal: number,
        public pitches: PitchMap
    ) {}

    getName() {
        return `${this.root}-${this.decimal}`;
    }

    getColor(): chroma.Color {
        const primeForm = this.getPrimeForm();
        const h = (360 / 12) * pitchNames.indexOf(primeForm.root);
        const pitchCount = Object.values(primeForm.pitches).reduce(
            (count, value) => (value ? count + 1 : count),
            0
        );
        const c = 100 - (100 / 11) * (pitchCount - 1);
        return chroma.hcl(h, c, 80);
    }

    getMidiValues(): number[] {
        const rootIndex = pitchNames.indexOf(this.root);

        const midiValues = Object.entries(this.pitches)
            .filter(([_, value]) => value)
            .map(([pitch]) => {
                const index = pitchNames.indexOf(pitch as Pitch);
                const midiValue = (index - 3) % 12;
                return index < rootIndex ? midiValue + 12 : midiValue; // Raise an octave if below root
            });

        return midiValues;
    }

    getPrimeForm(): Chord {
        const builder = new ChordBuilder(this);
        const decimals: number[] = [];

        decimals.push(builder.decimal!);
        builder.rotateOnce("L");

        while (!decimals.includes(builder.decimal!)) {
            decimals.push(builder.decimal!);
            builder.rotateOnce("L");
        }

        const minDecimal = decimals.reduce(
            (min, curr) => (curr < min ? curr : min),
            Number.MAX_SAFE_INTEGER
        );

        builder.rotate("R", decimals.length - decimals.indexOf(minDecimal));
        return builder.build() as Chord;
    }

    degreeToMidi(degree: number): number {
        const midiValues = this.getMidiValues().sort((a, b) => a - b);
        const octave = Math.floor(degree / midiValues.length) + BASE_OCTAVE;
        let index = degree % midiValues.length;
        while (index < 0) index += midiValues.length;
        return midiValues[index] + octave * 12;
    }

    midiToDegree(midiValue: number): number {
        const midiValues = this.getMidiValues().sort((a, b) => a - b);

        const zeroPitch = this.degreeToMidi(0);
        const octave = Math.floor((midiValue - zeroPitch) / 12);

        const closestIndex = circClosestIndex(midiValue, midiValues, 0, 12);

        const distToClosest = minCircDist(
            midiValue,
            midiValues[closestIndex],
            0,
            12
        );

        if (distToClosest === 0) {
            return closestIndex + midiValues.length * octave;
        } else {
            const lowerIndex = circWrap(
                distToClosest > 0 ? closestIndex : closestIndex - 1,
                0,
                midiValues.length
            );
            const upperIndex = circWrap(
                distToClosest > 0 ? closestIndex + 1 : closestIndex,
                0,
                midiValues.length
            );

            const lowerValue = midiValues[lowerIndex];
            const upperValue = midiValues[upperIndex];

            const numerator = circWrap(midiValue - lowerValue, 0, 12);
            const denominator = circWrap(upperValue - lowerValue, 0, 12);

            const fraction = numerator / denominator;

            return lowerIndex + fraction + midiValues.length * octave;
        }
    }

    static fromPitches(root: Pitch, pitches: PitchMap): Chord {
        const decimal = getDecimalFromPitches(pitches, root);
        return new Chord(root, decimal, pitches);
    }

    static fromDecimal(root: Pitch, decimal: number): Chord {
        const pitches = getPitchesFromDecimal(decimal, root);
        return new Chord(root, decimal, pitches);
    }
}

export class ChordBuilder {
    constructor(chordStatus?: Chord | PitchMap) {
        if (chordStatus) {
            if (chordStatus instanceof Chord) {
                this._root = chordStatus.root;
                this._decimal = chordStatus.decimal;
                this._pitches = Object.assign({}, chordStatus.pitches);
            } else {
                this._pitches = Object.assign({}, chordStatus);
            }
        }
    }

    private _root: Pitch | undefined;

    private _decimal: number | undefined;

    private _pitches = createEmptyPitchMap();

    get root() {
        return this._root;
    }

    get decimal() {
        return this._decimal;
    }

    get pitches() {
        return this._pitches;
    }

    set root(newRoot) {
        this._root = newRoot;

        if (this._root) {
            if (this._decimal) {
                this._pitches = getPitchesFromDecimal(
                    this._decimal,
                    this._root
                );
            } else {
                this._pitches[this._root] = true;
                this._decimal = getDecimalFromPitches(
                    this._pitches,
                    this._root
                );
            }
        }
    }

    set decimal(newDecimal: number | undefined) {
        this._decimal = newDecimal;

        if (this._root && this._decimal) {
            this._pitches = getPitchesFromDecimal(this._decimal, this._root);
        }
    }

    rotateOnce(direction: "L" | "R") {
        if (!this._root) return;

        const rootIndex = pitchNames.indexOf(this._root);

        let pitchEntries = Object.entries(this._pitches);

        pitchEntries = [
            ...pitchEntries.slice(rootIndex),
            ...pitchEntries.slice(0, rootIndex),
        ].slice(1); // Make root the first entry, then remove it

        if (direction === "L") pitchEntries.reverse();

        for (const [pitch, value] of pitchEntries) {
            if (value) {
                this._root = pitch as Pitch;
                this._decimal = getDecimalFromPitches(
                    this._pitches,
                    this._root
                );
                break;
            }
        }
    }

    rotate(direction: "L" | "R", rotations: number) {
        if (!this._root) return;

        if (rotations === 1) {
            this.rotateOnce(direction);
            return;
        }

        const rootIndex = pitchNames.indexOf(this._root);

        let pitchEntries = Object.entries(this._pitches);

        pitchEntries = [
            ...pitchEntries.slice(rootIndex),
            ...pitchEntries.slice(0, rootIndex),
        ].slice(1); // Make root the first entry, then remove it

        if (direction === "L") pitchEntries.reverse();

        const pitchCount = Object.values(this.pitches).reduce(
            (count, value) => (value ? count + 1 : count),
            0
        );

        rotations = rotations % pitchCount;

        let currRotations = 0;

        for (const [pitch, value] of pitchEntries) {
            if (!value) continue;

            currRotations++;

            if (currRotations === rotations) {
                this._root = pitch as Pitch;
                this._decimal = getDecimalFromPitches(
                    this._pitches,
                    this._root
                );
                break;
            }
        }
    }

    togglePitch(pitch: Pitch) {
        this._pitches[pitch] = !this._pitches[pitch];

        if (!this._root && this._pitches[pitch]) {
            // There is no root and a new pitch has been checked
            // Use the new pitch as the root
            this._root = pitch;
        } else if (pitch === this._root && !this._pitches[pitch]) {
            // Reflect that the root pitch has been unchecked
            this._root = undefined;
        }

        if (this._root) {
            this._decimal = getDecimalFromPitches(this._pitches, this._root);
        } else {
            // There is no root so the decimal cannot be told
            this._decimal = undefined;
        }
    }

    applyFilters(filters: Filter[]) {
        Object.entries(this._pitches).forEach(([pitch, value]) => {
            if (!value) return;

            const filterChords = filters
                .filter((filter) => !filter.isDisabled)
                .map((filter) => filter.chord);

            const isPitchInEveryChord = filterChords.every(
                (chord) => chord.pitches[pitch as Pitch]
            );

            if (!isPitchInEveryChord) {
                this.togglePitch(pitch as Pitch);
            }
        });
    }

    build(): Chord | PitchMap {
        if (this._root && this._decimal) {
            return new Chord(this._root, this._decimal, this._pitches);
        } else {
            return this._pitches;
        }
    }
}

export function getDecimalFromPitches(pitches: PitchMap, root?: Pitch): number {
    let binary = Object.values(pitches)
        .reverse()
        .map((value) => (value ? "1" : "0"))
        .join("");

    if (root) {
        const rootIndex = pitchNames.indexOf(root);

        // --- Example ---

        // what we have:
        // 000000001111
        //         |
        //         root (index 3)

        // what we want: (root must be last)
        // 111000000001
        //            |
        //            root

        // solution:
        binary =
            binary.slice(binary.length - rootIndex) +
            binary.slice(0, binary.length - rootIndex); // Shift binary according to root
    }

    return parseInt(binary, 2);
}

export function getPitchesFromDecimal(decimal: number, root?: Pitch): PitchMap {
    let binary = decimal.toString(2);
    while (binary.length < 12) binary = "0" + binary;

    if (root) {
        const rootIndex = pitchNames.indexOf(root);
        binary = binary.slice(rootIndex) + binary.slice(0, rootIndex); // Unshift binary according to root
    }

    return Object.fromEntries(
        pitchNames.map((pitch, index) => {
            const isPresent = binary[binary.length - index - 1] === "1";
            return [pitch, isPresent];
        })
    ) as PitchMap;
}
