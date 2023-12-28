import Attribute from "../../../../shared/architecture/AttributeEnum";
import MultiViewManager from "../../../../shared/architecture/multi_view_manager/MultiViewManager";
import { addChildren } from "../../../../shared/architecture/state/state_utils";
import mergeIntervals from "../../../../shared/utils/interval/merge_intervals/mergeIntervals";
import createSvgPath from "../../../../shared/utils/point/create_svg_path/createSvgPath";
import Item from "../../models/item/Item";
import { createItemState } from "../../models/item/ItemState";
import clearTrackInterval from "../../utils/clear_track_interval/clearTrackInterval";
import Path from "../../views/components/Highlight.svelte";
import createPaths from "./highlight/create_paths/createPaths";

import type Highlight from "./highlight/Highlight";

class HighlightManager {
    private _highlights: Highlight[] = [];

    private _viewManager = new MultiViewManager();

    set highlights(newHighlights: Highlight[]) {
        this._highlights = newHighlights;
        this.renderHighlights();
    }

    addHighlight(newHighlight: Highlight) {
        const highlights = this._highlights.filter(
            (highlight) => highlight.track === newHighlight.track
        );

        this._highlights = this._highlights.filter(
            (highlight) => !highlights.includes(highlight)
        );

        highlights.push(newHighlight);

        this._highlights.push(
            ...mergeIntervals(highlights).map((interval) => {
                return {
                    track: newHighlight.track,
                    start: interval.start,
                    end: interval.end,
                };
            })
        );

        this.renderHighlights();
    }

    renderHighlights() {
        const overlayElement = document.querySelector(
            `[${Attribute.Type}='overlay']`
        )!;

        const paths = createPaths(this._highlights);

        this._viewManager.setViews(
            paths.map((path) => {
                return new Path({
                    target: overlayElement,
                    props: {
                        path: createSvgPath(path),
                    },
                });
            })
        );
    }

    deleteSection() {
        this._highlights.forEach((highlight) => {
            clearTrackInterval(highlight.track, highlight.start, highlight.end);
        });
        this.highlights = [];
    }

    insertSection() {
        this._highlights.forEach((highlight) => {
            clearTrackInterval(highlight.track, highlight.start, highlight.end);
            addChildren(
                highlight.track,
                new Item(() =>
                    createItemState({
                        parent: highlight.track,
                        start: highlight.start,
                        end: highlight.end,
                        content: "empty",
                    })
                )
            );
        });
        this.highlights = [];
    }
}

export default HighlightManager;
