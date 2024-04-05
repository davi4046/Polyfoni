import type TimelineContext from "../TimelineContext";
import Item from "../../../models/item/Item";

export default function copySelectedItems(context: TimelineContext) {
    context.state = {
        clipboard: context.state.selectedItems.map(
            (item) => new Item(item.itemType, item.state)
        ),
    };
}
