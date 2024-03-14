import type Timeline from "../models/Timeline";
import StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";

import EditorWidgetManager from "./managers/EditorWidgetManager";
import HighlightManager from "./managers/HighlightManager";
import MoveManager from "./managers/MoveManager";
import SelectionManager from "./managers/SelectionManager";

class TimelineContext {
    readonly highlightManager = new HighlightManager();
    readonly selectionManager = new SelectionManager();
    readonly moveManager = new MoveManager();

    readonly editorWidgetManager;

    constructor(readonly timeline: Timeline) {
        this.editorWidgetManager = new EditorWidgetManager(this.timeline);

        const stateHierarchyWatcher = new StateHierarchyWatcher(
            timeline,
            (obj, oldState) => {
                console.log("obj:", obj);
                console.log("oldState:", oldState);
                // Generate stuff
            }
        );
    }
}

export default TimelineContext;
