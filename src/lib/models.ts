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
