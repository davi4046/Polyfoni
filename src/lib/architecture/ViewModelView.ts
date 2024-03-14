import type { ComponentType, SvelteComponent } from "svelte";

import type Model from "./Model";

export type ViewModelView<TState extends object> = ComponentType<
    SvelteComponent<
        {
            vm: Model<TState>;
        },
        {},
        {}
    >
>;
