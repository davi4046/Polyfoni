import type Timeline from "../models/timeline/Timeline";
import type CursorContext from "./CursorContext";
import type HighlightContext from "./HighlightContext";
import type MoveContext from "./MoveContext";
import type SelectionContext from "./SelectionContext";

class TimelineContext {
    constructor(
        readonly timeline: Timeline,
        readonly highlight: HighlightContext,
        readonly selection: SelectionContext,
        readonly cursor: CursorContext,
        readonly move: MoveContext
    ) {}
}

export default TimelineContext;
