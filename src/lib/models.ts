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

export class TimelineModel extends TreeNode<null, VoiceModel> {}

export class VoiceModel extends TreeNode<TimelineModel, TrackModel> {}

export class TrackModel extends TreeNode<VoiceModel, ItemModel> {}

export class ItemModel extends TreeNode<TrackModel, null> {
    constructor(
        public start: number,
        public end: number
    ) {
        super();
    }
}
