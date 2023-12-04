import Stateful from "../../../../shared/stateful/Stateful";

import type Item from "../../models/item/Item";
import type ItemVMState from "./ItemVMState";

class ItemVM extends Stateful<Item, ItemVMState> {}

export default ItemVM;
