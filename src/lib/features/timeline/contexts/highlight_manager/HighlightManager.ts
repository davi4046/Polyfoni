import { makeHull } from "../../../../shared/point/utils/convexHull";
import createSvgPath from "../../../../shared/point/utils/createSvgPath";
import Path from "../../views/components/Path.svelte";
import getCornerPoints from "./utils/getCornerPoints";
import groupByIndex from "./utils/groupByIndex";
import groupByVoice from "./utils/groupByVoice";

import type Highlight from "./utils/Highlight";

class HighlightManager {
    private _highlights: Highlight[] = [];

    private _paths: Path[] = [];

    set highlights(newHighlights: Highlight[]) {
        this._highlights = newHighlights;
        this.renderHighlights();
    }

    addHighlight(newHighlight: Highlight) {
        const highlight = this._highlights.find(
            (highlight) => highlight.track === newHighlight.track
        );
        if (highlight) {
            highlight.start = Math.min(highlight.start, newHighlight.start);
            highlight.end = Math.max(highlight.end, newHighlight.end);
        } else {
            this._highlights.push(newHighlight);
        }
        this.renderHighlights();
    }

    renderHighlights() {
        const groups = groupByVoice(this._highlights).map(groupByIndex).flat();

        for (const path of this._paths) {
            path.$destroy();
        }

        this._paths = groups.map((group) => {
            const points = group.map(getCornerPoints).flat();
            const convexHull = makeHull(points);
            const appElement = document.getElementById("app")!;

            return new Path({
                target: appElement,
                props: {
                    path: createSvgPath(convexHull),
                },
            });
        });
    }
}

export default HighlightManager;
