import mergeIntervals from "../../../../shared/utils/interval/merge_intervals/mergeIntervals";
import createSvgPath from "../../../../shared/utils/point/create_svg_path/createSvgPath";
import Path from "../../views/components/Path.svelte";
import createPaths from "./utils/createPaths";

import type Highlight from "./utils/Highlight";

class HighlightManager {
    private _highlights: Highlight[] = [];

    private _paths: Path[] = [];

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
        for (const path of this._paths) {
            path.$destroy();
        }
        this._paths = [];

        const appElement = document.getElementById("app")!;

        const paths = createPaths(this._highlights);

        for (const path of paths) {
            this._paths.push(
                new Path({
                    target: appElement,
                    props: {
                        path: createSvgPath(path),
                    },
                })
            );
        }
    }
}

export default HighlightManager;
