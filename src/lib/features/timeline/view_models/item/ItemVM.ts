import Model from "../../../../shared/architecture/model/Model";

interface ItemVMState {
    readonly start: number;
    readonly end: number;
    readonly text: string;
    readonly backgroundColor?: chroma.Color;
    readonly outlineColor?: chroma.Color;
    readonly opacity?: number;
    readonly handleMouseMove?: (event: MouseEvent) => void;
    readonly handleMouseMove_startHandle?: (event: MouseEvent) => void;
    readonly handleMouseMove_endHandle?: (event: MouseEvent) => void;
}

class ItemVM extends Model<Required<ItemVMState>> {}

export default ItemVM;
