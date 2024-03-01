import type Timeline from "../models/Timeline";
import EditorWidgetManager from "./managers/editor_widget_manager/EditorWidgetManager";
import HighlightManager from "./managers/highlight_manager/HighlightManager";
import MoveManager from "./managers/move_manager/MoveManager";
import SelectionManager from "./managers/selection_manager/SelectionManager";

class TimelineContext {
    readonly highlightManager = new HighlightManager();
    readonly selectionManager = new SelectionManager();
    readonly moveManager = new MoveManager();

    readonly editorWidgetManager;

    constructor(readonly timeline: Timeline) {
        this.editorWidgetManager = new EditorWidgetManager(this.timeline);
    }
}

export default TimelineContext;
