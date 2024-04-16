import { emit } from "@tauri-apps/api/event";

import type TimelineContext from "../TimelineContext";
import cropItemsByInterval from "../../../utils/cropItemsByInterval";
import {
    addChildren,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import type Highlight from "../../../models/highlight/Highlight";
import Item from "../../../models/item/Item";
import {
    itemInitialContentFunctions,
    type ItemTypes,
} from "../../../models/item/ItemTypes";

export default function insertEmptyItems(context: TimelineContext) {
    const newItems: Item<any>[] = [];

    context.state.highlights.forEach((highlight: Highlight<any>) => {
        const track = getParent(highlight);

        if (!track.isUserEditable()) return;

        track.state = {
            children: cropItemsByInterval(
                track.state.children as Item<any>[],
                highlight.state
            ),
        };

        const item = new Item(track.itemType, {
            parent: track,
            start: highlight.state.start,
            end: highlight.state.end,
            content:
                itemInitialContentFunctions[
                    track.itemType as keyof ItemTypes
                ](),
        });

        newItems.push(item);

        addChildren(track, item);
    });
    context.state = {
        highlights: [],
    };

    return newItems;
}
