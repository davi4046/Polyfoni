import pitchNames from "../pitchNames";
import type Item from "../../models/Item";
import {
    getChildren,
    getGreatGreatGrandparent,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import isOverlapping from "../../../../utils/interval/is_overlapping/isOverlapping";

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

    private _filters: readonly Chord[] = [];

    private _result: Chord | undefined;

    get root() {
        return this._root;
    }

    get decimal() {
        return this._decimal;
    }

    get pitches() {
        return Object.entries(this._pitches).filter(([pitch]) =>
            this._filters.every((scale) => scale.pitches[pitch as Pitch])
        ); // Only return pitches that are allowed by filters
    }

    get filters() {
        return this._filters;
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

    set filters(newFilters) {
        this._filters = newFilters;
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

    togglePitch(pitch: Pitch) {
        const newValue = !this._pitches[pitch];
        this._pitches[pitch] = newValue;

        if (!this._root && newValue) {
            // There is no root and a new pitch has been checked
            // Use the new pitch as the root
            this._root = pitch;
        } else if (pitch === this._root && !newValue) {
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

export function chordItemInitFunc(item: Item<"ChordItem">) {
    const timeline = getGreatGreatGrandparent(item);

    if (
        getParent(item) === timeline.scaleTrack ||
        getParent(item) === timeline.totalTrack
    ) {
        return;
    }

    function updateFilter() {
        const overlappingScaleItems = getChildren(timeline.scaleTrack).filter(
            (scaleItem) => isOverlapping(item.state, scaleItem.state)
        );

        const scales = overlappingScaleItems
            .map((scaleItem) => scaleItem.state.content.result as Chord)
            .filter((value): value is Chord => value !== undefined); // Scale must be specified

        item.state.content.filters = scales;
    }

    updateFilter();

    item.subscribe(updateFilter); // For when the item gets moved

    const unsubscribers: (() => void)[] = [];

    // Catch when a new scale item is added
    timeline.scaleTrack.subscribe(() => {
        updateFilter();

        unsubscribers.forEach((unsubscribe) => unsubscribe());

        const overlappingScaleItems = getChildren(timeline.scaleTrack).filter(
            (scaleItem) => isOverlapping(item.state, scaleItem.state)
        );

        overlappingScaleItems.forEach((scaleItem) => {
            // Catch when the value of an overlapping scale item changes
            const unsubscribe = scaleItem.subscribe(() => {
                if (isOverlapping(item.state, scaleItem.state)) {
                    updateFilter();
                } else {
                    unsubscribe();
                }
            });
            unsubscribers.push(unsubscribe);
        });
    });
}
