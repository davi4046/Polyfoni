import Model from "../../../../shared/architecture/model/Model";

import type ItemTypes from "../shared/ItemTypes";

import type { ItemState } from "./ItemState";

class Item<T extends keyof ItemTypes> extends Model<ItemState<T>> {
    constructor(
        readonly itemType: T,
        createState: (model: Model<ItemState<T>>) => Required<ItemState<T>>
    ) {
        super(createState);
    }
}

export default Item;
