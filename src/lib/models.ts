import { writable } from "svelte/store";

import { Controller } from "./controller";

abstract class TreeNode<
    T extends TreeNode<any, any> | null,
    U extends TreeNode<any, any> | null,
> {
    private _proxy: typeof this;
    private _parent: T | null = null;
    private _children: U[] = [];

    protected get proxy() {
        return this._proxy;
    }

    get parent() {
        return this._parent;
    }

    get children() {
        return this._children;
    }

    get controller() {
        return this._controller;
    }

    set parent(newParent: T | null) {
        let oldParent = this._parent;
        this._parent = newParent;
        if (oldParent) {
            if (oldParent.children.includes(this._proxy)) {
                oldParent.removeChild(this._proxy);
            }
        }
        if (newParent) {
            if (!newParent.children.includes(this._proxy)) {
                newParent.addChild(this._proxy);
            }
        }
    }

    addChild(child: U) {
        if (child) {
            this._children.push(child);
            if (child.parent !== this._proxy) {
                child.parent = this._proxy;
            }
        }
    }

    removeChild(child: U) {
        if (child) {
            let childIndex = this._children.indexOf(child);
            this._children.splice(childIndex, 1);
            if (child.parent === this._proxy) {
                child.parent = null;
            }
        }
    }

    getIndex() {
        return this._parent?.children.indexOf(this._proxy);
    }

    constructor(private _controller: Controller) {
        this._children = _controller.tracker.create([]);
        this._proxy = _controller.tracker.create(this);
        return this._proxy;
    }
}

export class TimelineModel extends TreeNode<null, VoiceModel> {
    private _store = writable(this);

    get store() {
        return this._store;
    }

    public length = 64;

    createVoice(label: string) {
        let newVoice = new VoiceModel(this.controller);
        newVoice.label = label;

        newVoice.createTrack("Pitch");
        newVoice.createTrack("Duration");
        newVoice.createTrack("Rest");
        newVoice.createTrack("Harmony");

        this.addChild(newVoice);

        return newVoice;
    }

    refresh() {
        this._store.update((value) => {
            return value;
        });
    }

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
}

export class VoiceModel extends TreeNode<TimelineModel, TrackModel> {
    public label = "";
    public isCollapsed = false;
    public generation: Promise<NoteModel[]> | null = null;

    createTrack(label: string) {
        let newTrack = new TrackModel(this.controller);
        newTrack.label = label;

        this.addChild(newTrack);

        return newTrack;
    }
}

export class TrackModel extends TreeNode<VoiceModel, ItemModel> {
    public label = "";

    getItemAtBeat(beat: number) {
        return this.children.find((item) => {
            return item.start <= beat && item.end > beat;
        });
    }

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
            let itemCopy = new ItemModel(end, i.end, i.controller);

            i.end = start;

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
}

export class ItemModel extends TreeNode<TrackModel, null> {
    public startHandle: ItemHandleModel | null = null;
    public endHandle: ItemHandleModel | null = null;

    public content = "";

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

    set parent(newParent: TrackModel | null) {
        super.parent = newParent;
        this.updateHandles();
    }

    get parent() {
        return super.parent;
    }

    move(newStart: number, newTrack: TrackModel) {
        let newEnd = newStart + this._end - this._start;

        this._start = newStart;
        this._end = newEnd;

        this.parent = newTrack;

        this.updateHandles();
    }

    isSelected() {
        return this.controller?.selectedItems.includes(this);
    }

    updateHandles() {
        if (this.startHandle) this.startHandle.itemL = undefined;
        if (this.endHandle) this.endHandle.itemR = undefined;

        if (!this.parent) return;

        let itemAtStart = this.parent.children.find((item) => {
            return item.end == this.start;
        });
        let itemAtEnd = this.parent.children.find((item) => {
            return item.start == this.end;
        });

        this.startHandle = new ItemHandleModel(
            this.start,
            itemAtStart,
            this.proxy,
            this.controller
        );
        this.endHandle = new ItemHandleModel(
            this.end,
            this.proxy,
            itemAtEnd,
            this.controller
        );

        if (itemAtStart) {
            itemAtStart.endHandle = this.startHandle;
        }
        if (itemAtEnd) {
            itemAtEnd.startHandle = this.endHandle;
        }
    }

    constructor(
        private _start: number,
        private _end: number,
        controller: Controller
    ) {
        super(controller);
    }
}

export class HighlightModel {
    constructor(
        public start: number,
        public end: number,
        public tracks: TrackModel[]
    ) {}
}

export class GhostItemModel {
    constructor(
        public item: ItemModel,
        public start: number,
        public end: number,
        public track: TrackModel
    ) {}
}

export class ItemHandleModel {
    private _beat = 0;

    updateBeat(newBeat: number): number {
        if (this.itemL && this.itemR) {
            if (newBeat <= this.itemL.start || newBeat >= this.itemR.end) {
                return this.beat;
            }
        } else if (this.itemL && this.itemL.parent) {
            let siblings = this.itemL.parent.children.slice();

            siblings.sort((a, b) => {
                if (a.start > b.start) {
                    return 1;
                } else {
                    return -1;
                }
            });

            let nextItem = siblings.find((item) => {
                return item.start >= this.itemL!.end;
            });

            if (nextItem) newBeat = Math.min(newBeat, nextItem.start);

            if (newBeat <= this.itemL.start) {
                return this._beat;
            }
        } else if (this.itemR && this.itemR.parent) {
            let siblings = this.itemR.parent.children.slice();

            siblings.sort((a, b) => {
                if (a.start > b.start) {
                    return 1;
                } else {
                    return -1;
                }
            });

            let prevItem = siblings.findLast((item) => {
                return item.end <= this.itemR!.start;
            });

            if (prevItem) newBeat = Math.max(newBeat, prevItem.end);

            if (newBeat >= this.itemR.end) {
                return this._beat;
            }
        }

        if (this.itemL) this.itemL.end = newBeat;
        if (this.itemR) this.itemR.start = newBeat;

        this._beat = newBeat;

        return newBeat;
    }

    get beat() {
        return this._beat;
    }

    constructor(
        beat: number,
        public itemL: ItemModel | undefined,
        public itemR: ItemModel | undefined,
        public controller: Controller | null
    ) {
        this.updateBeat(beat);
    }
}

export class NoteModel {
    constructor(
        public start: number,
        public end: number,
        public pitch: number,
        public isRest: boolean
    ) {}
}
