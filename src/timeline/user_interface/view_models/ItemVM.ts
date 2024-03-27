import Model from "../../../architecture/Model";

interface ItemVMState {
    start: number;
    end: number;

    text?: string;

    innerDivStyles?: Record<string, string>;
    outerDivStyles?: Record<string, string>;
    handleStyles?: Record<string, string>;

    handleMouseMove?: (event: MouseEvent) => void;
    handleMouseMove_startHandle?: (event: MouseEvent) => void;
    handleMouseMove_endHandle?: (event: MouseEvent) => void;

    onDestroy?: () => void;
}

export default class ItemVM extends Model<ItemVMState> {}
