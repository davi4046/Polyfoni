import ViewModel from "../../../../shared/view_model/ViewModel";

import type Item from "../../models/item/Item";
import type ItemVMState from "./ItemVMState";

class ItemVM extends ViewModel<Item, ItemVMState> {}

export default ItemVM;
