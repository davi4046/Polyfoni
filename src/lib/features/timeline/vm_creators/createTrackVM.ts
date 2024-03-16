import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import type Track from "../models/Track";
import type { ItemTypes } from "../utils/ItemTypes";
import type ItemVM from "../view_models/ItemVM";
import TrackVM from "../view_models/TrackVM";

import createItemVM from "./createItemVM";
import createItemVM_ghost from "./createItemVM_ghost";
import createNoteVM from "./createNoteVM";

const itemTypeVMCreatorMap: {
    [K in keyof ItemTypes]: (
        model: Item<K>,
        context: TimelineContext
    ) => ItemVM;
} = {
    StringItem: createItemVM,
    ChordItem: createItemVM,
    NoteItem: createNoteVM,
};

export default function createTrackVM<T extends keyof ItemTypes>(
    model: Track<T>,
    context: TimelineContext
): TrackVM {
    const createItems = () => {
        const items = model.state.children.map((item) => {
            return itemTypeVMCreatorMap[item.itemType](item, context);
        });

        const ghostItems = context.state.ghostPairs
            .map((pair) => pair[1])
            .filter((item) => item.state.parent === model)
            .map((item) => createItemVM_ghost(item, context));

        return [...items, ...ghostItems];
    };

    const vm = new TrackVM(
        {
            label: model.state.label,
            items: createItems(),
        },
        model.id
    );

    model.subscribe(() => {
        vm.state = {
            label: model.state.label,
            items: createItems(),
        };
    });

    context.subscribe(() => {
        vm.state = {
            items: createItems(),
        };
    });

    return vm;
}
