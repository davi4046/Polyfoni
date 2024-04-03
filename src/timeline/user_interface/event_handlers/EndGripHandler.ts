import { clamp } from "lodash";

import type TimelineContext from "../context/TimelineContext";
import cropItemsByInterval from "../../utils/cropItemsByInterval";
import type { GlobalEventHandler } from "../../../architecture/GlobalEventListener";
import {
    getChildren,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import type Item from "../../models/item/Item";
import getBeatAtClientX from "../../utils/screen_utils/getBeatAtClientX";

export default class EndGripHandler implements GlobalEventHandler {
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
            selectedGrips: new Map([
                [this.item, { property: "end", value: this.item.state.end }],
            ]),
        };
    }

    handleMouseMove(event: MouseEvent) {
        document.body.style.cursor = "e-resize";

        if (!this._isMouseDown) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, event.clientX)
        );

        const clampedBeat = Math.max(hoveredBeat, this.item.state.start + 1);

        if (clampedBeat === this._prevBeat) return;

        this._prevBeat = clampedBeat;

        this.context.state = {
            selectedGrips: new Map([
                [this.item, { property: "end", value: clampedBeat }],
            ]),
        };
    }

    handleMouseUp(event: MouseEvent) {
        this._isMouseDown = false;

        this.context.state = {
            selectedGrips: new Map(),
        };
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key !== "Shift") return;
    }
}

function cropItemInterval(item: Item<any>) {
    const track = getParent(item);
    const siblings = getChildren(track).filter((child) => child !== item);
    track.state = {
        children: cropItemsByInterval(siblings, item.state).concat(item),
    };
}
