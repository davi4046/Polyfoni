import type ChildState from "./ChildState";
import type ParentChildState from "./ParentChildState";
import type ParentState from "./ParentState";

type HasParent<TParent> = GetState<
    ChildState<TParent> | ParentChildState<TParent, any>
>;

type HasChildren<TChild> = GetState<
    ParentState<TChild> | ParentChildState<any, TChild>
>;

function getParent<T>(obj: HasParent<T>) {
    return obj.state.parent;
}

function getGrandparent<T>(obj: HasParent<HasParent<T>>) {
    return obj.state.parent.state.parent;
}

function getGreatGrandparent<T>(obj: HasParent<HasParent<HasParent<T>>>) {
    return obj.state.parent.state.parent.state.parent;
}

function getChildren<T>(obj: HasChildren<T>) {
    return obj.state.children;
}

function getIndex(obj: HasParent<HasChildren<any>>) {
    return obj.state.parent.state.children.indexOf(obj);
}

export {
    getParent,
    getGrandparent,
    getGreatGrandparent,
    getChildren,
    getIndex,
};
