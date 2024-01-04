import Model from "../../../../shared/architecture/model/Model";

import type ItemTypes from "../_shared/item_types/ItemTypes";

import type { ItemState } from "./ItemState";

class Item<T extends keyof ItemTypes> extends Model<ItemState<T>> {
    constructor(
        readonly itemType: T,
        state: Required<ItemState<T>>
    ) {
        super(state);
    }
}

export default Item;
