import type { Props } from "tippy.js";

import Stateful from "../../../architecture/Stateful";

interface ItemVMState {
    start: number;
    end: number;

    text?: string;

    innerDivStyles?: Record<string, string>;
    outerDivStyles?: Record<string, string>;
    startGripStyles?: Record<string, string>;
    endGripStyles?: Record<string, string>;

    handleMouseMove?: (event: MouseEvent) => void;
    handleMouseMove_startGrip?: (event: MouseEvent) => void;
    handleMouseMove_endGrip?: (event: MouseEvent) => void;

    onDestroy?: () => void;

    tooltip?: Partial<Props>;
}

export default class ItemVM extends Stateful<ItemVMState> {}
