import { clamp, clone } from "lodash";

import type TimelineContext from "../context/TimelineContext";
import cropItemsByInterval from "../../utils/cropItemsByInterval";
import type { GlobalEventHandler } from "../../../architecture/GlobalEventListener";
import {
    getChildren,
    getGrandparent,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import type Item from "../../models/item/Item";
import getBeatAtClientX from "../../utils/screen_utils/getBeatAtClientX";

export default class StartGripHandler implements GlobalEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item<any>
    ) {}

    private _isMouseDown = false;
    private _prevBeat?: number;

    getIsOverwritable(): boolean {
        return !this._isMouseDown;
    }

    handleMouseDown(event: MouseEvent) {
        this._isMouseDown = true;

        this.context.state = {
            grips: new Map([
                [
                    this.item,
                    { property: "start", value: this.item.state.start },
                ],
            ]),
        };
    }

    handleMouseMove(event: MouseEvent) {
        document.body.style.cursor = "e-resize";

        if (!this._isMouseDown) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, event.clientX)
        );

        const grippedItems = Array.from(this.context.state.grips.keys());

        const minEnd = grippedItems.reduce(
            (minEnd, item) =>
                item.state.end < minEnd ? item.state.end : minEnd,
            Number.MAX_SAFE_INTEGER
        );

        const clampedBeat = clamp(hoveredBeat, 0, minEnd - 1);

        if (clampedBeat === this._prevBeat) return;

        this._prevBeat = clampedBeat;

        this.context.state = {
            grips: new Map(
                grippedItems.map((item) => [
                    item,
                    { property: "start", value: clampedBeat },
                ])
            ),
        };
    }

    handleMouseUp(event: MouseEvent) {
        this._isMouseDown = false;

        Array.from(this.context.state.grips.entries()).forEach(
            ([item, grip]) => {
                item.state = {
                    start: grip.value,
                };
                cropItemInterval(item);
            }
        );

        this.context.state = {
            grips: new Map(),
        };
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key !== "Shift") return;

        const grippedItems = Array.from(this.context.state.grips.keys());
        const grippedPoint = this._prevBeat
            ? this._prevBeat
            : this.item.state.start;

        const tracks = getChildren(getGrandparent(this.item))
            .filter((track) => track.itemType !== "NoteItem")
            .filter((track) => {
                return !grippedItems.some((item) => getParent(item) === track);
            }); // Only search tracks where there is no gripped item

        const matchStartItems = tracks
            .flatMap((track) => getChildren(track))
            .filter((item) => {
                return item.state.start === grippedPoint;
            });

        const newGrips = clone(this.context.state.grips);

        matchStartItems.forEach((item) => {
            newGrips.set(item, {
                property: "start",
                value: item.state.start,
            });
        });

        this.context.state = {
            grips: newGrips,
        };
    }
}

function cropItemInterval(item: Item<any>) {
    const track = getParent(item);
    const siblings = getChildren(track).filter((child) => child !== item);
    track.state = {
        children: cropItemsByInterval(siblings, item.state).concat(item),
    };
}
