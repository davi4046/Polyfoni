import type Track from "../models/track/Track";

type Highlight = { track: Track; start: number; end: number };

class HighlightContext {
    private _highlights: Highlight[] = [];

    set highlights(newHighlights: Highlight[]) {
        this._highlights = newHighlights;
        console.log(newHighlights);
    }
}

export default HighlightContext;
