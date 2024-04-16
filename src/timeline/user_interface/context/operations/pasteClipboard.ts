import type TimelineContext from "../TimelineContext";
import { ChordBuilder } from "../../../models/item/Chord";
import Item from "../../../models/item/Item";
import type { ItemTypes } from "../../../models/item/ItemTypes";

export default function pasteClipboard(context: TimelineContext) {
    if (context.state.clipboard.length === 1) {
        const clipboardItem = context.state.clipboard[0];

        for (const item of context.state.selectedItems) {
            if (item.itemType !== clipboardItem.itemType) continue;

            const makeContent =
                makePastedContentFunctions[item.itemType as keyof ItemTypes];

            if (!makeContent) {
                console.warn(
                    "Missing function for making pasted content for this item type:",
                    item.itemType
                );
                return;
            }

            item.state = {
                content: makeContent(
                    // @ts-ignore
                    item.state.content,
                    clipboardItem.state.content
                ),
            };
        }
    } else {
        const newGhostPairs = context.state.clipboard.map((item) => {
            return [
                item,
                new Item(item.itemType, {
                    ...item.state,
                    start: item.state.start + 1,
                    end: item.state.end + 1,
                }),
            ] as [Item<any>, Item<any>];
        });

        context.state = {
            ghostPairs: newGhostPairs,
        };
    }
}

const makePastedContentFunctions: Partial<{
    [K in keyof ItemTypes]: (
        itemContent: ItemTypes[K],
        clipboardContent: ItemTypes[K]
    ) => ItemTypes[K];
}> = {
    StringItem: (_, clipboardContent) => clipboardContent,
    ChordItem: (itemContent, clipboardContent) => {
        const builder = new ChordBuilder(clipboardContent.chordStatus);

        builder.applyFilters(itemContent.filters);

        return {
            chordStatus: builder.build(),
            filters: itemContent.filters,
        };
    },
};
