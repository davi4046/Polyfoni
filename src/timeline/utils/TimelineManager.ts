import { emit, listen, type UnlistenFn } from "@tauri-apps/api/event";

import StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import { registerShortcut } from "../../utils/keyboard-shortcut";
import AliasManager from "../features/generation/AliasManager";
import Generator from "../features/generation/Generator";
import HarmonicSumGenerator from "../features/generation/HarmonicSumGenerator";
import type Timeline from "../models/timeline/Timeline";
import TimelineContext from "../user_interface/context/TimelineContext";
import {
    copyItems,
    createItems,
    cutItems,
    duplicateItems,
    pasteItems,
    redoAction,
    selectItems,
    undoAction,
} from "../user_interface/context/user-actions";
import type TimelineVM from "../user_interface/view_models/TimelineVM";
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

        this._setupKeyboardShortcuts(this._timelineContext);

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

    private _eventUnlistenFuncs: UnlistenFn[] = [];

    private async _setupKeyboardShortcuts(context: TimelineContext) {
        this._eventUnlistenFuncs.forEach((unlisten) => unlisten());

        registerShortcut("insert", () => createItems(context));
        registerShortcut("enter", () => selectItems(context));
        registerShortcut("ctrl+x", () => cutItems(context));
        registerShortcut("ctrl+c", () => copyItems(context));
        registerShortcut("ctrl+v", (event) => {
            pasteItems(context);
            event.preventDefault();
        });
        registerShortcut("ctrl+d", () => duplicateItems(context));
        registerShortcut("ctrl+z", () => undoAction(context));
        registerShortcut("ctrl+shift+z", () => redoAction(context));
        registerShortcut("ctrl+s", () => emit("save"));

        this._eventUnlistenFuncs = [
            await listen("create-items", () => createItems(context)),
            await listen("select-items", () => selectItems(context)),
            await listen("cut-items", () => cutItems(context)),
            await listen("copy-items", () => copyItems(context)),
            await listen("paste-items", () => pasteItems(context)),
            await listen("duplicate-items", () => duplicateItems(context)),
            await listen("undo-action", () => undoAction(context)),
            await listen("redo-action", () => redoAction(context)),
        ];
    }
}
