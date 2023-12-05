import type CursorContext from "./CursorContext";
import type HighlightContext from "./HighlightContext";
import type SelectionContext from "./SelectionContext";

class TimelineContext {
    constructor(
        readonly selection: SelectionContext,
        readonly highlight: HighlightContext,
        readonly cursor: CursorContext
    ) {}
}

export default TimelineContext;
