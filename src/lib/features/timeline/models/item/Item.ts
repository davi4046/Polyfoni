import Model from "../../../../shared/architecture/model/Model";

import type ItemTypes from "../_shared/ItemTypes";

import type { ItemState } from "./ItemState";

class Item<T extends keyof ItemTypes> extends Model<Item<T>, ItemState<T>> {
    constructor(
        readonly itemType: T,
        createState: (model: Item<T>) => Required<ItemState<T>>
    ) {
        super(createState);
    }
}

export default Item;
