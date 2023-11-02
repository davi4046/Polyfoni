import { writable } from "svelte/store";

import { Controller } from "./controller";

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

    getTracksFromTo(fromTrack: TrackModel, toTrack: TrackModel) {
        let tracks: TrackModel[] = [];

        let fromVoice = fromTrack.parent;
        let toVoice = toTrack.parent;

        if (fromVoice && toVoice) {
            if (fromVoice.parent == this && toVoice.parent == this) {
                let fromTrackIndex = fromVoice.children.indexOf(fromTrack);
                let toTrackIndex = toVoice.children.indexOf(toTrack);

                if (fromVoice == toVoice) {
                    let minTrackIndex = Math.min(fromTrackIndex, toTrackIndex);
                    let maxTrackIndex = Math.max(fromTrackIndex, toTrackIndex);

                    tracks = fromVoice.children.slice(
                        minTrackIndex,
                        maxTrackIndex + 1
                    );
                } else {
                    let fromVoiceIndex = this.children.indexOf(fromVoice);
                    let toVoiceIndex = this.children.indexOf(toVoice);

                    let minVoiceIndex = Math.min(fromVoiceIndex, toVoiceIndex);
                    let maxVoiceIndex = Math.max(fromVoiceIndex, toVoiceIndex);

                    tracks = this.children
                        .slice(minVoiceIndex + 1, maxVoiceIndex)
                        .map((voice) => {
                            return voice.children;
                        })
                        .flat();

                    if (fromVoiceIndex < toVoiceIndex) {
                        tracks = tracks.concat(
                            fromVoice.children.slice(
                                fromTrackIndex,
                                fromVoice.children.length
                            )
                        );
                        tracks = tracks.concat(
                            toVoice.children.slice(0, toTrackIndex + 1)
                        );
                    } else {
                        tracks = tracks.concat(
                            fromVoice.children.slice(0, fromTrackIndex + 1)
                        );
                        tracks = tracks.concat(
                            toVoice.children.slice(
                                toTrackIndex,
                                toVoice.children.length
                            )
                        );
                    }
                }
                return tracks;
            }
        }
        return null;
    }

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
    clearInterval(start: number, end: number) {
        this.children.sort((a, b) => {
            if (a.start < b.start) {
                return -1;
            } else {
                return 1;
            }
        });
        //last item starting before interval
        let i = this.children.findLast((item) => {
            return item.start < start;
        });
        //first item ending after interval
        let j = this.children.find((item) => {
            return item.end > end;
        });

        if (i == j && i != null) {
            //because i and j is the same item, we split it
            let itemCopy: ItemModel = Object.assign(
                Object.create(Object.getPrototypeOf(i)),
                i
            );

            i.end = start;

            itemCopy.start = end;

            super.addChild(itemCopy);
        } else {
            //remove items between i and j
            this.children
                .slice(
                    i != null ? this.children.indexOf(i) + 1 : 0,
                    j != null ? this.children.indexOf(j) : this.children.length
                )
                .forEach((child) => {
                    super.removeChild(child);
                });
            //crop i and j so they aren't overlapping the interval
            if (i != null) {
                i.end = Math.min(start, i.end);
            }
            if (j != null) {
                j.start = Math.max(end, j.start);
            }
        }
    }

    addChild(child: ItemModel) {
        this.clearInterval(child.start, child.end);
        super.addChild(child);
    }

    constructor(
        public type: TrackType,
        children: ItemModel[] = []
    ) {
        super(children);
    }
}

export class ItemModel extends TimelineNode<TrackModel, null> {
    set start(newStart: number) {
        if (newStart < this._start) {
            this.parent?.clearInterval(newStart, this._start);
        }
        this._start = newStart;
        if (this._end - this._start <= 0) {
            this.parent = null;
        }
    }

    get start() {
        return this._start;
    }

    set end(newEnd: number) {
        if (newEnd > this._end) {
            this.parent?.clearInterval(this._end, newEnd);
        }
        this._end = newEnd;
        if (this._end - this._start <= 0) {
            this.parent = null;
        }
    }

    get end() {
        return this._end;
    }

    move(newStart: number, newTrack: TrackModel) {
        let newEnd = newStart + this._end - this._start;

        this._start = newStart;
        this._end = newEnd;

        this.parent = newTrack;
    }

    isSelected() {
        return this.controller?.selectedItems.includes(this);
    }

    constructor(
        private _start: number,
        private _end: number
    ) {
        super();
    }
}

export class TimelineOutput {
    public harmonicSum = new TrackModel(4);
}
