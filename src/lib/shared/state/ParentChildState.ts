interface ParentChildState<TParent, TChild> {
    readonly parent: TParent;
    readonly children: readonly TChild[];
}

export type { ParentChildState as default };
