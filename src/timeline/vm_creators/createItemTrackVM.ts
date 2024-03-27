import type TimelineContext from "../context/TimelineContext";
import type Track from "../models/Track";
import type ItemVM from "../view_models/ItemVM";
import TrackVM from "../view_models/TrackVM";
import { getParent } from "../../architecture/state-hierarchy-utils";

import createHighlightVM from "./createHighlightVM";
import createItemVM from "./createItemVM";
import createItemVM_ghost from "./createItemVM_ghost";

export default function createItemTrackVM(
    model: Track<"StringItem" | "ChordItem">,
    context: TimelineContext
): TrackVM {
    let items: ItemVM[] = [];
    let ghostItems: ItemVM[] = [];
    let highlights: ItemVM[] = [];

    function remakeItems() {
        items = model.state.children.map((item) => {
            return createItemVM(item, context);
        });
    }

    function remakeGhostItems() {
        ghostItems = context.state.ghostPairs
            .map((pair) => pair[1])
            .filter((item) => item.state.parent === model)
            .map((item) => createItemVM_ghost(item, context));
    }

    function remakeHighlights() {
        highlights = context.state.highlights
            .filter((highlight) => getParent(highlight) === model)
            .map((highlight) => createHighlightVM(highlight, context));
    }

    remakeItems();
    remakeGhostItems();
    remakeHighlights();

    const vm = new TrackVM(
        {
            label: model.state.label,
            items: [...items, ...ghostItems, ...highlights],
        },
        model.id
    );

    model.subscribe((_, oldState) => {
        if (model.state.children !== oldState.children) remakeItems();

        vm.state = {
            label: model.state.label,
            items: [...items, ...ghostItems, ...highlights],
        };
    });

    context.subscribe((_, oldState) => {
        if (context.state.ghostPairs !== oldState.ghostPairs)
            remakeGhostItems();
        if (context.state.highlights !== oldState.highlights)
            remakeHighlights();

        vm.state = {
            items: [...items, ...ghostItems, ...highlights],
        };
    });

    return vm;
}
