export interface ChildState<TParent> {
    parent: TParent;
}

export interface ParentState<TChild> {
    children: readonly TChild[];
}

export interface GetState<TState> {
    get state(): TState;
}

export interface SetState<TState> {
    set state(newState: Partial<TState>);
}

type HasParent<TParent> = ChildState<TParent>;

type HasChildren<TChild> = ParentState<TChild>;

type HasGettableParent<TParent> = GetState<HasParent<TParent>>;

type HasGettableChildren<TChild> = GetState<HasChildren<TChild>>;

type HasSettableParent<TParent> = SetState<HasParent<TParent>>;

type HasSettableChildren<TParent> = SetState<HasChildren<TParent>>;

type LastAncestor<T> = T extends HasGettableParent<infer U>
    ? U extends HasGettableParent<any>
        ? LastAncestor<U>
        : U
    : T;

export function getParent<T>(obj: HasGettableParent<T>) {
    return obj.state.parent;
}

export function getGrandparent<T>(
    obj: HasGettableParent<HasGettableParent<T>>
) {
    return obj.state.parent.state.parent;
}

export function getGreatGrandparent<T>(
    obj: HasGettableParent<HasGettableParent<HasGettableParent<T>>>
) {
    return obj.state.parent.state.parent.state.parent;
}

export function getGreatGreatGrandparent<T>(
    obj: HasGettableParent<
        HasGettableParent<HasGettableParent<HasGettableParent<T>>>
    >
) {
    return obj.state.parent.state.parent.state.parent.state.parent;
}

export function getChildren<T>(obj: HasGettableChildren<T>) {
    return obj.state.children;
}

export function getIndex(obj: HasGettableParent<HasGettableChildren<any>>) {
    return obj.state.parent.state.children.indexOf(obj);
}

export function addChildren<T>(
    obj: HasSettableChildren<T> & HasGettableChildren<T>,
    ...children: T[]
) {
    obj.state = {
        children: [...obj.state.children, ...children],
    };
}

export function removeChildren<T>(
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

export function getPosition<
    T extends HasGettableParent<HasGettableChildren<any>>,
>(obj: T): Position<T> {
    const grandparent = getGrandparent(obj as any) as any;
    return {
        index: getIndex(obj),
        parentPos: (grandparent
            ? getPosition(getParent(obj) as any)
            : null) as any,
    };
}

export function isGreaterPos<T extends Position<any>>(a: T, b: T): boolean {
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

export function isDescendant(obj: object, potentialAncestor: object): boolean {
    let curr = obj;
    while ((curr as any).state.parent) {
        curr = (curr as any).state.parent;
        if (curr === potentialAncestor) return true;
    }
    return false;
}

export function countAncestors(obj: any): number {
    let curr = obj;
    let depth = 0;

    while (curr.state.parent) {
        curr = curr.state.parent;
        if (curr === obj) {
            throw Error("Tried to get depth of object in cyclical hierarchy");
        }
        depth += 1;
    }

    return depth;
}

export function getLastAncestor<T extends HasGettableParent<any>>(
    obj: T
): LastAncestor<T> {
    let curr = obj;
    while (curr.state.parent) curr = curr.state.parent;
    return curr as LastAncestor<T>;
}

export function getNestedArrayOfDescendants(
    obj: HasGettableChildren<any>,
    endDepth: number
) {
    return recursive(obj, endDepth);

    function recursive(
        obj: HasGettableChildren<any>,
        remainingDepth: number
    ): any[] {
        return obj.state.children
            .map((child) => {
                return child.state.children && remainingDepth > 1
                    ? recursive(child, remainingDepth - 1)
                    : child;
            })
            .filter((value) => value !== undefined);
    }
}
