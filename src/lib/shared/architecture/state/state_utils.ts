import type ChildState from "./ChildState";
import type ParentChildState from "./ParentChildState";
import type ParentState from "./ParentState";

interface GetState<TState> {
    get state(): TState;
}

interface SetState<TState> {
    set state(newState: Partial<TState>);
}

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

type Position<T extends HasGettableParent<HasGettableChildren<any>>> = {
    index: number;
    parentPos: T extends HasGettableParent<infer K>
        ? K extends HasGettableParent<HasGettableChildren<any>>
            ? Position<K>
            : null
        : null;
};

function getPosition<T extends HasGettableParent<HasGettableChildren<any>>>(
    obj: T
): Position<T> {
    const grandparent = getGrandparent(obj as any) as any;
    return {
        index: getIndex(obj),
        parentPos: (grandparent
            ? getPosition(getParent(obj) as any)
            : null) as any,
    };
}

function isGreaterPos<T extends Position<any>>(a: T, b: T): boolean {
    return isGreaterPosRecursive(a, b, false);
}

function isGreaterPosRecursive<T extends Position<any>>(
    a: T,
    b: T,
    prevResult: boolean
): boolean {
    const result = a.index === b.index ? prevResult : a.index > b.index;

    if (a.parentPos && b.parentPos) {
        return isGreaterPosRecursive(a.parentPos, b.parentPos, result);
    } else {
        return result;
    }
}

export {
    type GetState,
    type SetState,
    getParent,
    getGrandparent,
    getGreatGrandparent,
    getChildren,
    getIndex,
    addChildren,
    removeChildren,
    getPosition,
    isGreaterPos,
};
