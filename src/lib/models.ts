import { writable } from "svelte/store";

import type { Writable } from "svelte/store";

abstract class TreeNode<
    T extends TreeNode<any, any> | null,
    U extends TreeNode<any, any> | null,
> {
    private _parent: T | null = null;
    private _children: U[] = [];

    constructor(children: U[] = []) {
        children.forEach((c) => {
            this.addChild(c);
        });
    }

    get parent() {
        return this._parent;
    }

    set parent(newParent: T | null) {
        let oldParent = this._parent;
        this._parent = newParent;
        if (oldParent) {
            if (oldParent.children.includes(this)) {
                oldParent.removeChild(this);
            }
        }
        if (newParent) {
            if (!newParent.children.includes(this)) {
                newParent.addChild(this);
            }
        }
    }

    get children() {
        return this._children;
    }

    addChild(child: U) {
        if (child) {
            this._children.push(child);
            if (child.parent !== this) {
                child.parent = this;
            }
        }
    }

    removeChild(child: U) {
        if (child) {
            this._children = this._children.filter((c) => c !== child);
            if (child.parent === this) {
                child.parent = null;
            }
        }
    }
}

abstract class TimelineNode<
    T extends TimelineNode<any, any> | null,
    U extends TimelineNode<any, any> | null,
> extends TreeNode<T, U> {
    private _controller: Controller | null = null;

    set controller(newController: Controller | null) {
        this._controller = newController;
        this.children.forEach((child) => {
            if (child) {
                child.controller = newController;
            }
        });
    }

    get controller() {
        return this._controller;
    }

    addChild(child: U): void {
        super.addChild(child);
        if (child) {
            child.controller = this.controller;
        }
    }

    removeChild(child: U): void {
        super.removeChild(child);
        if (child) {
            child.controller = null;
        }
    }
}

export class TimelineModel extends TimelineNode<null, VoiceModel> {
    public output = new TimelineOutput();

    public meterTrack = new TrackModel(5);
    public tempoTrack = new TrackModel(6);

    public store = writable(this);

    constructor(
        public length: number,
        children: VoiceModel[] = []
    ) {
        super(children);
        this.controller = new Controller(this.store);
    }
}

export class VoiceModel extends TimelineNode<TimelineModel, TrackModel> {
    constructor(
        public name: string,
        children: TrackModel[] = [],
        public isCollapsed = false
    ) {
        super(children);
    }
}

enum TrackType {
    Pitch,
    Duration,
    Rest,
    Velocity,
    Harmony,
    Meter,
    Tempo,
}

export class TrackModel extends TimelineNode<VoiceModel, ItemModel> {
    constructor(
        public type: TrackType,
        children: ItemModel[] = []
    ) {
        super(children);
    }
}

export class ItemModel extends TimelineNode<TrackModel, null> {
    constructor(
        public start: number,
        public end: number
    ) {
        super();
    }
}

export class TimelineOutput {
    public harmonicSum = new TrackModel(4);
}

class Controller {
    private _clickedPos: number | null = null;
    private _clickedTrack: TrackModel | null = null;

    private _hoveredPos: number | null = null;
    private _hoveredTrack: TrackModel | null = null;

    public highlight: Highlight | null = null;

    setHoveredPos(newPos: number) {
        this._hoveredPos = newPos;
        this.updateHighlight();
    }

    setHoveredTrack(newTrack: TrackModel) {
        this._hoveredTrack = newTrack;
        this.updateHighlight();
    }

    updateHighlight() {
        if (
            this._hoveredPos &&
            this._hoveredTrack &&
            this._clickedPos &&
            this._clickedTrack
        ) {
            let clickedBeat = Math.round(this._clickedPos / 64);
            let hoveredBeat = Math.round(this._hoveredPos / 64);

            let start = Math.min(clickedBeat, hoveredBeat);
            let end = Math.max(clickedBeat, hoveredBeat);

            let tracks: TrackModel[] = [];

            let clickedTrackVoice = this._clickedTrack.parent;
            let hoveredTrackVoice = this._hoveredTrack.parent;

            if (clickedTrackVoice && hoveredTrackVoice) {
                if (clickedTrackVoice == hoveredTrackVoice) {
                    //single-voice highlight
                    let clickedTrackIndex = clickedTrackVoice.children.indexOf(
                        this._clickedTrack
                    );
                    let clickedVoiceIndex = clickedTrackVoice.children.indexOf(
                        this._hoveredTrack
                    );

                    let minIndex = Math.min(
                        clickedTrackIndex,
                        clickedVoiceIndex
                    );
                    let maxIndex = Math.max(
                        clickedTrackIndex,
                        clickedVoiceIndex
                    );

                    tracks = clickedTrackVoice.children.slice(
                        minIndex,
                        maxIndex + 1
                    );
                } else {
                    //cross-voice highlight
                    let timeline = clickedTrackVoice.parent!;

                    let clickedVoiceIndex =
                        timeline.children.indexOf(clickedTrackVoice);
                    let hoveredVoiceIndex =
                        timeline.children.indexOf(hoveredTrackVoice);

                    let minIndex = Math.min(
                        clickedVoiceIndex,
                        hoveredVoiceIndex
                    );
                    let maxIndex = Math.max(
                        clickedVoiceIndex,
                        hoveredVoiceIndex
                    );

                    tracks = timeline.children
                        .slice(minIndex + 1, maxIndex)
                        .map((voice) => {
                            return voice.children;
                        })
                        .flat();

                    let clickedTrackIndex = clickedTrackVoice.children.indexOf(
                        this._clickedTrack
                    );

                    let hoveredTrackIndex = hoveredTrackVoice.children.indexOf(
                        this._hoveredTrack
                    );

                    if (clickedVoiceIndex > hoveredVoiceIndex) {
                        tracks = tracks.concat(
                            clickedTrackVoice.children.slice(
                                0,
                                clickedTrackIndex + 1
                            )
                        );
                        tracks = tracks.concat(
                            hoveredTrackVoice.children.slice(
                                hoveredTrackIndex,
                                hoveredTrackVoice.children.length
                            )
                        );
                    } else {
                        tracks = tracks.concat(
                            clickedTrackVoice.children.slice(
                                clickedTrackIndex,
                                clickedTrackVoice.children.length
                            )
                        );
                        tracks = tracks.concat(
                            hoveredTrackVoice.children.slice(
                                0,
                                hoveredTrackIndex + 1
                            )
                        );
                    }
                }
            }

            this.highlight = new Highlight(tracks, [[start, end]]);

            this._store.update((value) => {
                return value;
            });
        }
    }

    constructor(private _store: Writable<TimelineModel>) {
        document.addEventListener("mousedown", (_) => {
            if (this._hoveredPos) {
                this._clickedPos = this._hoveredPos;
            }
            if (this._hoveredTrack) {
                this._clickedTrack = this._hoveredTrack;
            }
        });

        document.addEventListener("mouseup", (_) => {
            this._clickedPos = null;
            this._clickedTrack = null;
        });

        document.addEventListener("mousemove", (event) => {
            let cursorArea = <HTMLElement>(
                document.getElementsByClassName("cursor-area")[0]
            );

            this.setHoveredPos(event.clientX - cursorArea.offsetLeft);
        });
    }
}

class Highlight {
    constructor(
        public tracks: TrackModel[],
        public intervals: [number, number][]
    ) {}
}
