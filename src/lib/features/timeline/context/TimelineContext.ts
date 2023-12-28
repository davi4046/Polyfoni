import type Timeline from "../models/timeline/Timeline";
import type HighlightManager from "./highlight_manager/HighlightManager";
import type MoveManager from "./move_manager/MoveManager";
import type SelectionManager from "./selection_manager/SelectionManager";

class TimelineContext {
    constructor(
        readonly timeline: Timeline,
        readonly highlightManager: HighlightManager,
        readonly selectionManager: SelectionManager,
        readonly moveManager: MoveManager
    ) {}
}

export default TimelineContext;
