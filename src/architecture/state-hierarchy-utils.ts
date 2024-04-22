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
            throw Error(
                "Tried to count ancestors of object in cyclical hierarchy"
            );
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

export function getDescendants(obj: any): any[] {
    const visitied = new Set<object>();

    const recursive = (obj: any): any[] => {
        if (!(obj.state && obj.state.children) || visitied.has(obj)) return [];

        visitied.add(obj);

        return obj.state.children.flatMap((child: any) => [
            child,
            recursive(child),
        ]);
    };

    return recursive(obj);
}

export function getNestedArrayOfDescendants(
    obj: HasGettableChildren<any>,
    depth: number
) {
    return recursive(obj, depth);

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

export function getPosition(obj: any): number[] {
    const position = [];

    let curr = obj;

    while (curr.state.parent) {
        position.unshift(curr.state.parent.state.children.indexOf(curr));
        curr = curr.state.parent;
    }

    return position;
}

export function doesValueMatchSymbol(value: number, symbol: string): boolean {
    if (symbol.includes("-")) {
        const subparts = symbol.split("-");

        if (subparts.length !== 2)
            throw new Error(`Invalid symbol: "${symbol}"`);

        const min =
            subparts[0] === "*" ? Number.MIN_SAFE_INTEGER : Number(subparts[0]);
        const max =
            subparts[1] === "*" ? Number.MAX_SAFE_INTEGER : Number(subparts[1]);

        if (isNaN(min) || isNaN(max))
            throw new Error(`Invalid symbol: "${symbol}"`);

        if (value < min || value > max) {
            return false;
        }
    } else if (symbol !== "*" && String(value) !== symbol) {
        return false;
    }
    return true;
}

export function isPositionOnPath(position: number[], path: string): boolean {
    const symbols = path.split(",");
    let match = true;
    for (let i = 0; i < Math.min(position.length, symbols.length); i++) {
        if (!doesValueMatchSymbol(position[i], symbols[i])) {
            match = false;
            break;
        }
    }
    return match;
}

export function matchPositionToPath<T>(
    position: number[],
    map: Map<string, T>
): T | undefined {
    for (const [pattern, value] of map) {
        if (isPositionOnPath(position, pattern)) {
            return value;
        }
    }
}
