import Model from "../../../architecture/Model";

interface ItemVMState {
    start: number;
    end: number;

    text?: string;
    styles?: Record<string, string>;

    handleMouseMove?: (event: MouseEvent) => void;
    handleMouseMove_startHandle?: (event: MouseEvent) => void;
    handleMouseMove_endHandle?: (event: MouseEvent) => void;
}

class ItemVM extends Model<ItemVMState> {}

export default ItemVM;
