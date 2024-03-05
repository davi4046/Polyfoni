import pitchNames from "../pitchNames";

type Pitch = (typeof pitchNames)[number];
type PitchMap = { [K in Pitch]: boolean };

export default class ChordBuilder {
    private _root: Pitch | undefined;

    private _decimal: number | undefined;

    private _pitches = this._initPitches();

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

        if (this._decimal) {
            // Update pitches
        }
    }

    set decimal(newDecimal) {
        this._decimal = newDecimal;

        if (this._root) {
            // Update pitches
        }
    }

    private _initPitches() {
        const obj = Object.fromEntries(
            pitchNames.map((pitch) => [pitch, false])
        ) as PitchMap;

        const builder = this;

        return new Proxy(obj, {
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
}
