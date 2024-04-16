import { clamp } from "lodash";

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
    ) {
        this._grippedPoint = item.state.start;
    }

    private _isMouseDown = false;
    private _grippedItems: Item<any>[] = [];
    private _grippedPoint: number = 0;

    getIsOverwritable(): boolean {
        return !this._isMouseDown;
    }

    handleMouseDown(event: MouseEvent) {
        this._isMouseDown = true;

        this._grippedItems = [this.item];
        this._updateGrips();
    }

    handleMouseMove(event: MouseEvent) {
        document.body.style.cursor = "e-resize";

        if (!this._isMouseDown) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, event.clientX)
        );

        const minEnd = this._grippedItems.reduce(
            (minEnd, item) =>
                item.state.end < minEnd ? item.state.end : minEnd,
            Number.MAX_SAFE_INTEGER
        );

        const clampedBeat = clamp(hoveredBeat, 0, minEnd - 1);

        if (clampedBeat === this._grippedPoint) return;

        this._grippedPoint = clampedBeat;
        this._updateGrips();
    }

    handleMouseUp(event: MouseEvent) {
        this._isMouseDown = false;

        this.context.history.startAction();

        this._grippedItems.forEach((item) => {
            item.state = {
                start: this._grippedPoint,
            };
            cropItemInterval(item);
        });

        this.context.history.endAction("Adjusted item start");

        this._grippedItems = [];
        this._updateGrips();
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key !== "Shift") return;

        const tracks = getChildren(getGrandparent(this.item))
            .filter((track) => track.itemType !== "NoteItem")
            .filter((track) => {
                return !this._grippedItems.some(
                    (item) => getParent(item) === track
                );
            }); // Only search tracks where there is no gripped item

        const matchStartItems = tracks
            .flatMap((track) => getChildren(track))
            .filter((item) => {
                return item.state.start === this._grippedPoint;
            });

        this._grippedItems = this._grippedItems.concat(matchStartItems);
        this._updateGrips();
    }

    private _updateGrips() {
        this.context.state = {
            visualStartOverrideMap: new Map(
                this._grippedItems.map((item) => [item, this._grippedPoint])
            ),
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
