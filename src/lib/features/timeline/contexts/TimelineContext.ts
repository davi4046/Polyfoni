import type HighlightContext from "./HighlightContext";
import type SelectionContext from "./SelectionContext";

class TimelineContext {
    constructor(
        readonly selection: SelectionContext,
        readonly highlight: HighlightContext
    ) {}
}

export default TimelineContext;
