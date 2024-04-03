import StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import type Stateful from "../../../architecture/Stateful";
import type Timeline from "../../models/timeline/Timeline";

export default class TimelineHistory {
    constructor(timeline: Timeline) {
        const watcher = new StateHierarchyWatcher(timeline);

        watcher.subscribe((obj, oldState) => {
            if (!this._currAction) return;

            const newState = obj.state;

            this._currAction.changes.push({ obj, oldState, newState });
        });
    }

    private _currAction?: Action;
    private _undoableActions: Action[] = [];
    private _redoableActions: Action[] = [];

    startAction(title: string) {
        if (this._currAction) {
            console.warn(
                "Tried to start an action" +
                    "but the current action" +
                    "has not been ended yet"
            );
            return;
        }
        this._currAction = new Action(title);
    }

    endAction() {
        if (!this._currAction) {
            console.warn("Tried to end action but no action has been started");
            return;
        }
        this._undoableActions.push(this._currAction);
        this._currAction = undefined;

        console.log(this._undoableActions);
    }

    undoAction() {
        const lastAction = this._undoableActions.pop();

        if (!lastAction) return;

        lastAction.changes.reverse().forEach(({ obj, oldState, newState }) => {
            obj.state = oldState;
        });

        this._redoableActions.push(lastAction);
        console.log("undo:", lastAction.title);
    }

    redoAction() {
        const lastAction = this._redoableActions.pop();

        if (!lastAction) return;

        lastAction.changes.reverse().forEach(({ obj, oldState, newState }) => {
            obj.state = newState;
        });

        this._undoableActions.push(lastAction);
        console.log("redo:", lastAction.title);
    }
}

class Action {
    constructor(
        readonly title: string,
        readonly changes: StateChange<any>[] = []
    ) {}
}

type StateChange<TState extends object> = {
    obj: Stateful<TState>;
    oldState: TState | undefined;
    newState: TState | undefined;
};
