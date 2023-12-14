import type ChildState from "./ChildState";
import type ParentChildState from "./ParentChildState";
import type ParentState from "./ParentState";

type HasParent<TParent> = ChildState<TParent> | ParentChildState<TParent, any>;

type HasChildren<TChild> = ParentState<TChild> | ParentChildState<any, TChild>;

type HasGettableParent<TParent> = GetState<HasParent<TParent>>;

type HasGettableChildren<TChild> = GetState<HasChildren<TChild>>;

type HasSettableParent<TParent> = SetState<HasParent<TParent>>;

type HasSettableChildren<TParent> = SetState<HasChildren<TParent>>;

function getParent<T>(obj: HasGettableParent<T>) {
    return obj.state.parent;
}

function getGrandparent<T>(obj: HasGettableParent<HasGettableParent<T>>) {
    return obj.state.parent.state.parent;
}

function getGreatGrandparent<T>(
    obj: HasGettableParent<HasGettableParent<HasGettableParent<T>>>
) {
    return obj.state.parent.state.parent.state.parent;
}

function getChildren<T>(obj: HasGettableChildren<T>) {
    return obj.state.children;
}

function getIndex(obj: HasGettableParent<HasGettableChildren<any>>) {
    return obj.state.parent.state.children.indexOf(obj);
}

function addChildren<T>(
    obj: HasSettableChildren<T> & HasGettableChildren<T>,
    ...children: T[]
) {
    obj.state = {
        children: [...obj.state.children, ...children],
    };
}

function removeChildren<T>(
    obj: HasSettableChildren<T> & HasGettableChildren<T>,
    ...children: T[]
) {
    obj.state = {
        children: obj.state.children.filter(
            (other) => !children.includes(other)
        ),
    };
}

export {
    getParent,
    getGrandparent,
    getGreatGrandparent,
    getChildren,
    getIndex,
    addChildren,
    removeChildren,
};
