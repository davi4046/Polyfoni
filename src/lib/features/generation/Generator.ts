import type StateHierarchyWatcher from "../../architecture/StateHierarchyWatcher";
import type Timeline from "../timeline/models/Timeline";

export default class Generator {
    private _stateChanges: StateChange<any>[] = [];

    constructor(watcher: StateHierarchyWatcher<Timeline>) {
        watcher.subscribe((obj, oldState) => {
            const newState = obj.state;
            this._stateChanges.push({ oldState, newState });

            if (this._stateChanges.length === 1) {
                const handleNextChangeLoop = () => {
                    const nextChange = this._stateChanges.shift();

                    if (nextChange) {
                        this._handleChange(nextChange).then(
                            handleNextChangeLoop
                        );
                    } else {
                        //else render output
                    }
                };
                handleNextChangeLoop();
            }
        });
    }

    private async _handleChange(change: StateChange<any>) {}
}

type StateChange<TState extends object> = {
    oldState: TState;
    newState: TState;
};

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
