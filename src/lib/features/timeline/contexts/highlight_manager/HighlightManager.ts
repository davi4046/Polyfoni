import type Highlight from "./utils/Highlight";

class HighlightManager {
    private _highlights: Highlight[] = [];

    set highlights(newHighlights: Highlight[]) {
        this._highlights = newHighlights;
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
    }
}

export default HighlightManager;
