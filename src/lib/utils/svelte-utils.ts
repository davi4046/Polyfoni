import type { ComponentConstructorOptions } from "svelte";

export class SveltePropsMatchCtor<
    T extends SvelteComponentConstructor<any, any>,
> {
    constructor(
        readonly ctor: T,
        readonly props: InstanceType<T>["$$prop_def"]
    ) {}
}

export class SvelteCtorMatchProps<T extends Record<string, any>> {
    constructor(
        readonly ctor: SvelteComponentConstructor<
            any,
            ComponentConstructorOptions<T>
        >,
        readonly props: T
    ) {}
}
