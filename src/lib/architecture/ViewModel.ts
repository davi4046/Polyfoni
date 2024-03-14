import type { ComponentType, SvelteComponent } from "svelte";

import Model from "./Model";

export default class ViewModel<TState extends object> extends Model<TState> {
    constructor(view: ViewModelView<TState>, state: TState, id?: string) {
        super(state, id);
    }
}

type ViewModelView<TState extends object> = ComponentType<
    SvelteComponent<
        {
            vm: ViewModel<TState>;
        },
        {},
        {}
    >
>;
