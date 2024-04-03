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
    ) {}

    private _isMouseDown = false;

    getIsOverwritable(): boolean {
        return !this._isMouseDown;
    }

    handleMouseDown(event: MouseEvent) {
        this._isMouseDown = true;

        this.context.state = {
            selectedGrips: [this.item],
            gripMode: "end",
        };
    }

    handleMouseMove(event: MouseEvent) {
        document.body.style.cursor = "e-resize";

        if (!this._isMouseDown) return;

        const hoveredBeat = Math.round(
            getBeatAtClientX(this.context.timeline, event.clientX)
        );

        const maxStart = this.context.state.selectedGrips.reduce(
            (maxStart, item) =>
                item.state.start > maxStart ? item.state.start : maxStart,
            Number.MIN_SAFE_INTEGER
        );

        const newEnd = Math.max(hoveredBeat, maxStart + 1);

        if (newEnd === this.item.state.end) return;

        this.context.state.selectedGrips.forEach((item) => {
            item.state = {
                end: newEnd,
            };
        });
    }

    handleMouseUp(event: MouseEvent) {
        this._isMouseDown = false;

        this.context.state.selectedGrips.forEach(cropItemInterval);

        this.context.state = {
            selectedGrips: [],
        };
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key !== "Shift") return;

        const tracks = getChildren(getGrandparent(this.item))
            .filter((track) => track.itemType !== "NoteItem")
            .filter((track) => {
                return !this.context.state.selectedGrips.some(
                    (item) => getParent(item) === track
                );
            }); // Only search on tracks where there is no gripped item

        const matchEndItems = tracks
            .flatMap((track) => getChildren(track))
            .filter((item) => {
                return item.state.end === this.item.state.end;
            });

        this.context.state = {
            selectedGrips:
                this.context.state.selectedGrips.concat(matchEndItems),
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
