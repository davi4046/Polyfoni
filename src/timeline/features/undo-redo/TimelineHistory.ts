import { emit } from "@tauri-apps/api/event";

import StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import type Stateful from "../../../architecture/Stateful";
import type Timeline from "../../models/timeline/Timeline";

export default class TimelineHistory {
    constructor(timeline: Timeline) {
        const watcher = new StateHierarchyWatcher(timeline);

        watcher.subscribe((obj, oldState, newState) => {
            if (!this._currAction) return;

            this._currAction.changes.push({ obj, oldState, newState });
        });

        emit("report-action-index", {
            index: this._undoableActions.length,
        });
    }

    private _currAction?: Action;
    private _undoableActions: Action[] = [];
    private _redoableActions: Action[] = [];

    startAction() {
        if (this._currAction) {
            console.warn(
                "Tried to start an action" +
                    " but the current action" +
                    " has not been ended yet"
            );
            return;
        }
        this._currAction = new Action();
        this._redoableActions = [];
    }

    endAction(title: string) {
        if (!this._currAction) {
            console.warn("Tried to end action but no action has been started");
            return;
        }

        if (this._currAction.changes.length > 0) {
            this._currAction.title = title;
            this._undoableActions.push(this._currAction);

            emit("display-message", { message: this._currAction.title });

            emit("report-action-index", {
                index: this._undoableActions.length,
            });
        }

        this._currAction = undefined;
    }

    undoAction() {
        const lastAction = this._undoableActions.pop();

        if (!lastAction) return;

        lastAction.changes.reverse().forEach(({ obj, oldState, newState }) => {
            obj.state = oldState;
        });

        this._redoableActions.push(lastAction);

        emit("display-message", { message: `Undo "${lastAction.title}"` });

        emit("report-action-index", {
            index: this._undoableActions.length,
        });
    }

    redoAction() {
        const lastAction = this._redoableActions.pop();

        if (!lastAction) return;

        lastAction.changes.reverse().forEach(({ obj, oldState, newState }) => {
            obj.state = newState;
        });

        this._undoableActions.push(lastAction);

        emit("display-message", { message: `Redo "${lastAction.title}"` });

        emit("report-action-index", {
            index: this._undoableActions.length,
        });
    }
}

class Action {
    constructor(
        public title: string = "",
        public changes: StateChange<any>[] = []
    ) {}
}

type StateChange<TState extends object> = {
    obj: Stateful<TState>;
    oldState: TState | undefined;
    newState: TState | undefined;
};
