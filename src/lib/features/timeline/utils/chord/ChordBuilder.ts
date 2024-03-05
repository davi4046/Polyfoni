import pitchNames from "../pitchNames";

type Pitch = (typeof pitchNames)[number];
type PitchMap = { [K in Pitch]: boolean };

export default class ChordBuilder {
    private _root: Pitch | undefined;

    private _decimal: number | undefined;

    private _pitches = Object.fromEntries(
        pitchNames.map((pitch) => [pitch, false])
    ) as PitchMap;

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

                if (key === builder._root && value === false) {
                    // Find a new root
                }

                // --- Update decimal ---

                const rootIndex = pitchNames.indexOf(builder._root!);

                let binary = Object.values(target)
                    .reverse()
                    .map((value) => (value ? "1" : "0"))
                    .join("");

                binary = binary.slice(rootIndex) + binary.slice(0, rootIndex); // Shift binary according to root

                builder._decimal = parseInt(binary, 2);

                return true;
            },
        });
    }

    set root(newRoot) {
        this._root = newRoot;

        if (this._root && this._decimal) {
            this._pitches = getPitchesFromRootAndDecimal(
                this._root,
                this._decimal
            );
        }
    }

    set decimal(newDecimal) {
        this._decimal = newDecimal;

        if (this._root && this._decimal) {
            this._pitches = getPitchesFromRootAndDecimal(
                this._root,
                this._decimal
            );
        }
    }
}

function getPitchesFromRootAndDecimal(root: Pitch, decimal: number): PitchMap {
    const rootIndex = pitchNames.indexOf(root);

    let binary = decimal.toString(2);

    while (binary.length < 12) {
        binary = "0" + binary;
    }

    binary = binary.slice(rootIndex) + binary.slice(0, rootIndex); // Shift binary according to root

    return Object.fromEntries(
        pitchNames.map((pitch, index) => {
            const isPresent = binary[binary.length - index - 1] === "1";
            return [pitch, isPresent];
        })
    ) as PitchMap;
}
