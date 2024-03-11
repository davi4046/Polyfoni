import pitchNames from "../pitchNames";

type Pitch = (typeof pitchNames)[number];
type PitchMap = { [K in Pitch]: boolean };

type Filter = { chord: Required<Chord>; isDisabled: boolean };

export type ChordItemContent = {
    chord: Chord;
    filters: Filter[];
};

export class Chord {
    public pitches = Object.fromEntries(
        pitchNames.map((pitch) => [pitch, false])
    ) as PitchMap;

    constructor(
        public root?: Pitch,
        public decimal?: number
    ) {
        if (root && decimal) {
            this.pitches = getPitchesFromRootAndDecimal(root, decimal);
        }
    }

    getName() {
        return this.root && this.decimal
            ? `${this.root}-${this.decimal}`
            : "undefined";
    }
}

export class ChordBuilder {
    constructor(chord?: Chord) {
        this._root = chord?.root;
        this._decimal = chord?.decimal;

        if (this._root && this._decimal) {
            this._pitches = getPitchesFromRootAndDecimal(
                this._root,
                this._decimal
            );
        }
    }

    private _root: Pitch | undefined;

    private _decimal: number | undefined;

    private _pitches = Object.fromEntries(
        pitchNames.map((pitch) => [pitch, false])
    ) as PitchMap;

    private _result: Chord | undefined;

    get root() {
        return this._root;
    }

    get decimal() {
        return this._decimal;
    }

    get pitches() {
        return this._pitches;
    }

    get result() {
        return this._result;
    }

    set root(newRoot) {
        this._root = newRoot;

        if (this._root) {
            if (this._decimal) {
                this._pitches = getPitchesFromRootAndDecimal(
                    this._root,
                    this._decimal
                );
            } else {
                this._pitches[this._root] = true;
                this._decimal = getDecimalFromRootAndPitches(
                    this._root,
                    this._pitches
                );
            }
        }
    }

    set decimal(newDecimal: number | undefined) {
        this._decimal = newDecimal;

        if (this._root && this._decimal) {
            this._pitches = getPitchesFromRootAndDecimal(
                this._root,
                this._decimal
            );
        }
    }

    rotate(direction: "L" | "R") {
        if (!this._root) return;

        const rootIndex = pitchNames.indexOf(this._root);

        let pitchEntries = Object.entries(this._pitches);

        pitchEntries = [
            ...pitchEntries.slice(rootIndex),
            ...pitchEntries.slice(0, rootIndex),
        ].slice(1); // Make root the first entry

        if (direction === "L") pitchEntries.reverse();

        for (const [pitch, value] of pitchEntries) {
            if (value) {
                this._root = pitch as Pitch;
                this._decimal = getDecimalFromRootAndPitches(
                    this._root,
                    this._pitches
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
            this._decimal = getDecimalFromRootAndPitches(
                this._root,
                this._pitches
            );
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
}

function getDecimalFromRootAndPitches(root: Pitch, pitches: PitchMap): number {
    const rootIndex = pitchNames.indexOf(root);

    let binary = Object.values(pitches)
        .reverse()
        .map((value) => (value ? "1" : "0"))
        .join("");

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

    return parseInt(binary, 2);
}

function getPitchesFromRootAndDecimal(root: Pitch, decimal: number): PitchMap {
    const rootIndex = pitchNames.indexOf(root);

    let binary = decimal.toString(2);

    while (binary.length < 12) {
        binary = "0" + binary;
    }

    binary = binary.slice(rootIndex) + binary.slice(0, rootIndex); // Unshift binary according to root

    return Object.fromEntries(
        pitchNames.map((pitch, index) => {
            const isPresent = binary[binary.length - index - 1] === "1";
            return [pitch, isPresent];
        })
    ) as PitchMap;
}
