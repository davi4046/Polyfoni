import type Timeline from "../models/timeline/Timeline";
import type HighlightContext from "./highlight_context/HighlightContext";
import type MoveContext from "./MoveContext";
import type SelectionContext from "./SelectionContext";

class TimelineContext {
    constructor(
        readonly timeline: Timeline,
        readonly highlight: HighlightContext,
        readonly selection: SelectionContext,
        readonly move: MoveContext
    ) {}
}

export default TimelineContext;
