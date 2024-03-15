import type TimelineContext from "../TimelineContext";
import type Item from "../../models/Item";

export default function toggleItemSelected(
    context: TimelineContext,
    item: Item<any>
) {
    if (context.state.selectedItems.includes(item)) {
        // Deselect item
        context.state = {
            selectedItems: context.state.selectedItems.filter(
                (value) => value !== item
            ),
        };
    } else {
        // Select item
        context.state = {
            selectedItems: context.state.selectedItems.concat(item),
        };
    }
}
