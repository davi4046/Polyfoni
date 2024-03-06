import pitchNames from "../pitchNames";

type Pitch = (typeof pitchNames)[number];
type PitchMap = { [K in Pitch]: boolean };

export class Chord {
    constructor(
        readonly root: Pitch,
        readonly decimal: number,
        readonly pitches: PitchMap
    ) {}

    get name() {
        return `${this.root}-${this.decimal}`;
    }
}

export class ChordBuilder {
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
        const builder = this;
        return new Proxy(this._pitches, {
            set(target, key, value) {
                target[key as keyof PitchMap] = value;

                if (!builder._root && value) {
                    // There is no root and a new pitch has been checked
                    // Use the new pitch as the root
                    builder._root = key as Pitch;
                } else if (key === builder._root && !value) {
                    // Reflect that the root pitch has been unchecked
                    builder._root = undefined;
                }

                if (builder._root) {
                    builder._decimal = getDecimalFromRootAndPitches(
                        builder._root,
                        builder._pitches
                    );
                } else {
                    // There is no root so the decimal cannot be told
                    builder._decimal = undefined;
                }

                builder._updateResult();

                return true;
            },
        });
    }

    get result() {
        return this._result;
    }

    set root(newRoot) {
        this._root = newRoot;

        if (this._root && this._decimal) {
            this._pitches = getPitchesFromRootAndDecimal(
                this._root,
                this._decimal
            );
        }

        this._updateResult();
    }

    set decimal(newDecimal) {
        this._decimal = newDecimal;

        if (this._root && this._decimal) {
            this._pitches = getPitchesFromRootAndDecimal(
                this._root,
                this._decimal
            );
        }

        this._updateResult();
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

        this._updateResult();
    }

    private _updateResult() {
        this._result =
            this._root && this._decimal
                ? new Chord(this._root, this._decimal, this._pitches)
                : undefined;
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
