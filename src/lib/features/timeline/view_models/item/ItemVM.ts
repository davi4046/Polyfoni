import BoundModel from "../../../../shared/architecture/bound_model/BoundModel";

import type Item from "../../models/item/Item";
import type { ItemVMState } from "./ItemVMState";

class ItemVM extends BoundModel<Item<any>, ItemVMState> {}

export default ItemVM;
