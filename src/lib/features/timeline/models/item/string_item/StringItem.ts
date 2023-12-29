import type Model from "../../../../../shared/architecture/model/Model";
import StringItemEditor from "../../../views/item_editors/StringItemEditor.svelte";
import Item from "../Item";

import type { ItemState } from "../ItemState";

class StringItem extends Item<string> {
    constructor(
        state: (model: Model<ItemState<string>>) => Required<ItemState<string>>
    ) {
        super(state, StringItemEditor);
    }
}

export default StringItem;
