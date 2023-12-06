import type CursorContext from "./CursorContext";
import type HighlightContext from "./HighlightContext";
import type MoveContext from "./MoveContext";
import type SelectionContext from "./SelectionContext";

class TimelineContext {
    constructor(
        readonly highlight: HighlightContext,
        readonly selection: SelectionContext,
        readonly cursor: CursorContext,
        readonly move: MoveContext
    ) {}
}

export default TimelineContext;
