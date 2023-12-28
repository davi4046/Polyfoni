import createSvgPath from "../../../../shared/utils/point/utils/createSvgPath";
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
        const highlight = this._highlights.find((highlight) => {
            return highlight.track === newHighlight.track;
        });

        let isOverlapping = false;

        if (highlight) {
            isOverlapping =
                (highlight.start >= newHighlight.start &&
                    highlight.start <= newHighlight.end) ||
                (highlight.end >= newHighlight.start &&
                    highlight.end <= newHighlight.end);
        }

        if (highlight && isOverlapping) {
            highlight.start = Math.min(highlight.start, newHighlight.start);
            highlight.end = Math.max(highlight.end, newHighlight.end);
        } else {
            this._highlights.push(newHighlight);
        }

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
