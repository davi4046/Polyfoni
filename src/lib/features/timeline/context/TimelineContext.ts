import type Timeline from "../models/timeline/Timeline";
import type HighlightManager from "./managers/highlight_manager/HighlightManager";
import type MoveManager from "./managers/move_manager/MoveManager";
import type SelectionManager from "./managers/selection_manager/SelectionManager";

class TimelineContext {
    constructor(
        readonly timeline: Timeline,
        readonly highlightManager: HighlightManager,
        readonly selectionManager: SelectionManager,
        readonly moveManager: MoveManager
    ) {}
}

export default TimelineContext;
