import type Timeline from "../models/Timeline";

import EditorWidgetManager from "./managers/EditorWidgetManager";
import HighlightManager from "./managers/HighlightManager";
import HistoryManager from "./managers/HistoryManager";
import MoveManager from "./managers/MoveManager";
import SelectionManager from "./managers/SelectionManager";

class TimelineContext {
    readonly highlightManager = new HighlightManager();
    readonly selectionManager = new SelectionManager();
    readonly moveManager = new MoveManager();

    readonly editorWidgetManager;
    readonly historyManager;

    constructor(readonly timeline: Timeline) {
        this.editorWidgetManager = new EditorWidgetManager(this.timeline);
        this.historyManager = new HistoryManager(this.timeline);
    }
}

export default TimelineContext;
