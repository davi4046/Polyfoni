import type DragBehaviour from "../../../../shared/behaviours/drag/DragBehaviour";
import type TimelineContext from "../../contexts/TimelineContext";

class ItemDrag implements DragBehaviour {
    constructor(private _context: TimelineContext) {}

    readonly drag = (
        fromX: number,
        fromY: number,
        toX: number,
        toY: number
    ) => {
        console.log("item dragged");
    };

    readonly drop = () => {};
}

export default ItemDrag;
