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
        //index of last item starting before interval
        let i = this.children.findLastIndex((item) => {
            return item.start < start;
        });
        //index of first item ending after interval
        let j = this.children.findIndex((item) => {
            return item.end > end;
        });

        if (i == j && i != -1 && j != -1) {
            //because i and j is the same item, we split it
            let itemCopy: ItemModel = Object.assign(
                Object.create(Object.getPrototypeOf(this.children[i])),
                this.children[i]
            );

            this.children[i].end = start;

            itemCopy.start = end;

            super.addChild(itemCopy);
        } else {
            //remove items between i and j
            if (i == -1 && j == -1) {
                this.children.forEach((child) => {
                    this.removeChild(child);
                });
            } else if (i == -1) {
                this.children.slice(0, j).forEach((child) => {
                    this.removeChild(child);
                });
            } else if (j == -1) {
                this.children.slice(i + 1).forEach((child) => {
                    this.removeChild(child);
                });
            } else {
                this.children.slice(i + 1, j).forEach((child) => {
                    this.removeChild(child);
                });
            }
            //crop i and j so they aren't overlapping the interval
            if (i != -1) {
                this.children[i].end = Math.min(start, this.children[i].end);
            }
            if (j != -1) {
                this.children[j].start = Math.max(end, this.children[j].start);
            }
        }
    }

    addChild(child: ItemModel): void {
        this.clearInterval(child.start, child.end);

        super.addChild(child);

        this.children.sort((a, b) => {
            if (a.start < b.start) {
                return -1;
            } else if (a.start > b.start) {
                return 1;
            }
            return 0;
        });
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

    move(newStart: number) {
        let length = this._end - this._start;
        let newEnd = newStart + length;
        this.parent?.clearInterval(newStart, newEnd);
        this._start = newStart;
        this._end = newEnd;
    }

    constructor(
        private _start: number,
        private _end: number
    ) {
        super();
    }
}

export class HighlightModel {
    constructor(
        public start: number,
        public end: number,
        public tracks: TrackModel[]
    ) {}
}

export class TimelineOutput {
    public harmonicSum = new TrackModel(4);
}
