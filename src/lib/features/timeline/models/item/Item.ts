import type { SvelteComponent } from "svelte";
import Model from "../../../../shared/architecture/model/Model";

import type { ItemState } from "./ItemState";

class Item<TContent> extends Model<ItemState<TContent>> {
    readonly EditorWidget;

    constructor(
        state: (
            model: Model<ItemState<TContent>>
        ) => Required<ItemState<TContent>>,

        EditorWidget?: typeof SvelteComponent<
            {
                update: (value: TContent) => void;
            },
            {},
            {}
        >
    ) {
        super(state);
        this.EditorWidget = EditorWidget;
    }
}

export default Item;
