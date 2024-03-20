import type StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import { countAncestors } from "../../architecture/state-hierarchy-utils";
import type { ItemState } from "../timeline/models/Item";
import type Timeline from "../timeline/models/Timeline";
import type { TrackState } from "../timeline/models/Track";

export default class Generator {
    private _itemChanges: ItemChange[] = [];
    private _isHandlingChanges = false;

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        watcher.subscribe((obj, oldState) => {
            const objDepth = countAncestors(obj);
            const newState = obj.state as any;
            const change = { oldState, newState };

            switch (objDepth) {
                // Track
                case 3: {
                    this._itemChanges.push(
                        ...deriveItemChangesFromTrackChange(change)
                    );
                    break;
                }
                // Item
                case 4: {
                    this._itemChanges.push(change);
                    break;
                }
            }

            if (this._itemChanges.length > 0 && !this._isHandlingChanges) {
                const handleNextChangeLoop = () => {
                    const nextChange = this._itemChanges.shift();

                    if (nextChange) {
                        this._handleChange(nextChange).then(
                            handleNextChangeLoop
                        );
                    } else {
                        this._isHandlingChanges = false;
                        //render output
                    }
                };
                this._isHandlingChanges = true;
                handleNextChangeLoop();
            }
        });
    }

    private async _handleChange(change: ItemChange) {
        if (change.oldState) this._clearItemStateEffect(change.oldState);
        if (change.newState) this._applyItemStateEffect(change.newState);
    }

    private _clearItemStateEffect(itemState: ItemState<any>) {}

    private _applyItemStateEffect(itemState: ItemState<any>) {}
}

type StateChange<TState> = {
    oldState: TState;
    newState: TState;
};

type ItemChange = StateChange<ItemState<any> | undefined>;

function deriveItemChangesFromTrackChange(
    change: StateChange<TrackState<any>>
): ItemChange[] {
    const removedItems = change.oldState.children.filter((child) => {
        return !change.newState.children.includes(child);
    });

    const addedItems = change.newState.children.filter((child) => {
        return !change.oldState.children.includes(child);
    });

    const itemChanges: ItemChange[] = [];

    removedItems.forEach((item) => {
        itemChanges.push({ oldState: item.state, newState: undefined });
    });

    addedItems.forEach((item) => {
        itemChanges.push({ oldState: undefined, newState: item.state });
    });

    return itemChanges;
}

class NoteBuilder {
    constructor(
        public start: number,
        public end: number
    ) {}

    degree?: number;
    pitch?: number;
    isRest?: boolean;
}

type TrackTypes = {
    output: "NoteItem";
    pitch: "StringItem";
    duration: "StringItem";
    rest: "StringItem";
    harmony: "ChordItem";
};

function trackTypeToIndex(trackType: keyof TrackTypes): number {
    switch (trackType) {
        case "output":
            return 0;
        case "pitch":
            return 1;
        case "duration":
            return 2;
        case "rest":
            return 3;
        case "harmony":
            return 4;
    }
}

function trackIndexToType(index: number): keyof TrackTypes | undefined {
    switch (index) {
        case 0:
            return "output";
        case 1:
            return "pitch";
        case 2:
            return "duration";
        case 3:
            return "rest";
        case 4:
            return "harmony";
    }
}
