import BoundModel from "../../../../shared/architecture/bound_model/BoundModel";

import type Item from "../../models/item/Item";
import type { ItemVMState } from "./ItemVMState";

//@ts-ignore
class ItemVM extends BoundModel<Item<any>, Required<ItemVMState>, {}> {}

export default ItemVM;
