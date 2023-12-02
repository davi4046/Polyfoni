import type HighlightContext from "./HighlightContext";
import type SelectionContext from "./SelectionContext";

class TimelineContext {
    constructor(
        private _selectionContext: SelectionContext,
        private _highlightContext: HighlightContext
    ) {}

    get selectionContext() {
        return this._selectionContext;
    }

    get highlightContext() {
        return this._highlightContext;
    }
}

export default TimelineContext;
