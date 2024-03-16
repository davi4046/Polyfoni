import Model from "../../../architecture/Model";

interface ItemVMState {
    start: number;
    end: number;
    text: string;
    bgColor: chroma.Color;
    outlineColor: chroma.Color;
    opacity: number;
    handleMouseMove: (event: MouseEvent) => void;
    handleMouseMove_startHandle: (event: MouseEvent) => void;
    handleMouseMove_endHandle: (event: MouseEvent) => void;
}

class ItemVM extends Model<ItemVMState> {}

export default ItemVM;
