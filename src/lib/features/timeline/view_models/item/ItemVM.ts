import ViewModel from '../../../../shared/view_model/ViewModel';

import type Item from "../../models/item/Item";
import type { ItemVMState } from "./ItemVMState";

type ItemVM = ViewModel<Item, ItemVMState> & Required<ItemVMState>;

export type { ItemVM as default };
