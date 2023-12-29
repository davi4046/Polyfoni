import Model from "../../../../shared/architecture/model/Model";

import type { ItemState } from "./ItemState";

class Item<TContent> extends Model<ItemState<TContent>> {}

export default Item;
