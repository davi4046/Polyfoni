import findElementByModelId from "../../../../../shared/utils/find_element_by_model_id/findElementByModelId";
import getClientXAtBeat from "../../../utils/get_client_x_at_beat/getClientXAtBeat";
import HighlightVM from "../../../view_models/highlight/highlightVM";
import { createHighlightVMState } from "../../../view_models/highlight/highlightVMState";
import Highlight from "../../../views/Highlight.svelte";
import TimelineDrag from "../TimelineDrag";

import type Track from "../../../models/track/Track";

class HighlightDrag extends TimelineDrag {
    private _highlightVM?: HighlightVM;
    private _highlight?: Highlight;

    protected handleDrag(
        fromBeat: number,
        toBeat: number,
        fromTrack: Track,
        toTrack: Track
    ): void {
        const fromX = getClientXAtBeat(this.context.timeline, fromBeat);
        const toX = getClientXAtBeat(this.context.timeline, toBeat);

        const rect1 = findElementByModelId(
            fromTrack.id
        )!.getBoundingClientRect();
        const rect2 = findElementByModelId(toTrack.id)!.getBoundingClientRect();

        const fromY = Math.min(rect1.top, rect2.top);
        const toY = Math.max(rect1.bottom, rect2.bottom);

        if (this._highlight && this._highlightVM) {
            this._highlightVM.state = {
                x1: fromX,
                x2: toX,
                y1: fromY,
                y2: toY,
            };
            return;
        }

        this._highlightVM = new HighlightVM(() =>
            createHighlightVMState({
                x1: fromX,
                x2: toX,
                y1: fromY,
                y2: toY,
            })
        );

        const appElement = document.getElementById("app")!;

        this._highlight = new Highlight({
            target: appElement,
            props: {
                vm: this._highlightVM,
            },
        });
    }

    protected handleDrop(): void {}
}

export default HighlightDrag;
