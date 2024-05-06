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

export default class EndGripHandler implements GlobalEventHandler {
    constructor(
        readonly context: TimelineContext,
        readonly item: Item<any>
    ) {
        this._grippedPoint = item.state.end;
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

        const maxStart = this._grippedItems.reduce(
            (maxStart, item) =>
                item.state.start > maxStart ? item.state.start : maxStart,
            Number.MIN_SAFE_INTEGER
        );

        const clampedBeat = Math.max(hoveredBeat, maxStart + 1);

        if (clampedBeat === this._grippedPoint) return;

        this._grippedPoint = clampedBeat;
        this._updateGrips();
    }

    handleMouseUp(event: MouseEvent) {
        this._isMouseDown = false;

        this.context.history.startAction();

        this._grippedItems.forEach((item) => {
            const track = getParent(item);

            const siblings = getChildren(track).filter(
                (child) => child !== item
            );

            // 1.
            track.state = {
                children: cropItemsByInterval(siblings, item.state).concat(
                    item
                ),
            };

            // 2.
            item.state = { end: this._grippedPoint };

            // (sequence is important for correct generation)
        });

        this.context.history.endAction("Adjusted item end");

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
                return item.state.end === this._grippedPoint;
            });

        this._grippedItems = this._grippedItems.concat(matchStartItems);
        this._updateGrips();
    }

    private _updateGrips() {
        this.context.state = {
            visualEndOverrideMap: new Map(
                this._grippedItems.map((item) => [item, this._grippedPoint])
            ),
        };
    }
}
