import MultiViewManager from "../../../../shared/architecture/multi_view_manager/MultiViewManager";
import mergeIntervals from "../../../../shared/utils/interval/merge_intervals/mergeIntervals";
import createSvgPath from "../../../../shared/utils/point/create_svg_path/createSvgPath";
import Path from "../../views/components/Highlight.svelte";
import createPaths from "./utils/createPaths";

import type Highlight from "./utils/Highlight";

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
        const appElement = document.getElementById("app")!;

        const paths = createPaths(this._highlights);

        this._viewManager.setViews(
            paths.map((path) => {
                return new Path({
                    target: appElement,
                    props: {
                        path: createSvgPath(path),
                    },
                });
            })
        );
    }
}

export default HighlightManager;
