import { emit } from "@tauri-apps/api/event";

import StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import { registerShortcut } from "../../utils/keyboard-shortcut";
import AliasManager from "../features/generation/AliasManager";
import Generator from "../features/generation/Generator";
import HarmonicSumGenerator from "../features/generation/HarmonicSumGenerator";
import type Timeline from "../models/timeline/Timeline";
import TimelineContext from "../user_interface/context/TimelineContext";
import type TimelineVM from "../user_interface/view_models/TimelineVM";
import copyHighlightedItems from "../user_interface/context/operations/copyHighlightedItems";
import copySelectedItems from "../user_interface/context/operations/copySelectedItems";
import cropHighlightedItems from "../user_interface/context/operations/cropHighlightedItems";
import deleteSelectedItems from "../user_interface/context/operations/deleteSelectedItems";
import insertEmptyItems from "../user_interface/context/operations/insertEmptyItems";
import pasteClipboard from "../user_interface/context/operations/pasteClipboard";
import selectHighlightedItems from "../user_interface/context/operations/selectHighlightedItems";
import createTimelineVM from "../user_interface/vm_creators/timeline_vm/createTimelineVM";

export class TimelineManager {
    constructor() {}

    private _timeline?: Timeline;
    private _timelineContext?: TimelineContext;
    private _timelineVM?: TimelineVM;

    async loadTimeline(timeline: Timeline) {
        this._timeline = timeline;
        this._timelineContext = new TimelineContext(timeline);
        this._timelineVM = createTimelineVM(timeline, this._timelineContext);

        setupShortcuts(this._timelineContext);

        const watcher = new StateHierarchyWatcher(timeline);
        const aliasManager = new AliasManager();

        // 1.
        await aliasManager.init(watcher);
        // 2.
        new Generator(watcher);
        new HarmonicSumGenerator(watcher);
    }

    get timeline() {
        return this._timeline;
    }

    get timelineVM() {
        return this._timelineVM;
    }
}

function setupShortcuts(timelineContext: TimelineContext) {
    registerShortcut("insert", () => {
        timelineContext.history.startAction();

        const newItems = insertEmptyItems(timelineContext);

        timelineContext.history.endAction(
            newItems.length > 1
                ? `Inserted ${newItems.length} empty items`
                : `Inserted 1 empty item`
        );
    });

    registerShortcut("enter", () => {
        selectHighlightedItems(timelineContext);
    });

    registerShortcut("ctrl+x", () => {
        timelineContext.history.startAction();

        if (timelineContext.state.highlights.length > 0) {
            copyHighlightedItems(timelineContext);
            cropHighlightedItems(timelineContext);
        } else {
            copySelectedItems(timelineContext);
            deleteSelectedItems(timelineContext);
        }

        timelineContext.history.endAction("Cut selection");
    });

    registerShortcut("ctrl+c", () => {
        if (timelineContext.state.highlights.length > 0) {
            copyHighlightedItems(timelineContext);
        } else {
            copySelectedItems(timelineContext);
        }
        emit("display-message", {
            message: "Copied selection to clipbaord",
        });
    });

    registerShortcut("ctrl+v", () => {
        pasteClipboard(timelineContext);
        emit("display-message", {
            message: "Pasted clipboard",
        });
    });

    registerShortcut("ctrl+z", () => {
        timelineContext.history.undoAction();
    });

    registerShortcut("ctrl+shift+z", () => {
        timelineContext.history.redoAction();
    });

    registerShortcut("ctrl+s", () => {
        emit("save");
    });
}
