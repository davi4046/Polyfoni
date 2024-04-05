import type TimelineContext from "../TimelineContext";
import Item from "../../../models/item/Item";

export default function pasteClipboard(context: TimelineContext) {
    context.state = {
        ghostPairs: context.state.clipboard.map((item) => {
            return [
                item,
                new Item(item.itemType, {
                    ...item.state,
                    start: item.state.start + 1,
                    end: item.state.end + 1,
                }),
            ];
        }),
    };
}
