import type CursorContext from "./CursorContext";
import type HighlightContext from "./HighlightContext";
import type SelectionContext from "./SelectionContext";

class TimelineContext {
    constructor(
        readonly highlight: HighlightContext,
        readonly selection: SelectionContext,
        readonly cursor: CursorContext
    ) {}
}

export default TimelineContext;
