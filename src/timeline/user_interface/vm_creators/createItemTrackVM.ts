import type TimelineContext from "../context/TimelineContext";
import type ItemVM from "../view_models/ItemVM";
import TrackVM from "../view_models/TrackVM";
import PipeEnd from "../visuals/icons/PipeEnd.svelte";
import PipeMid from "../visuals/icons/PipeMid.svelte";
import {
    getChildren,
    getIndex,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import compareStates from "../../../utils/compareStates";
import type Track from "../../models/track/Track";

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

    function makeLabel() {
        return {
            label: model.state.label,
        };
    }

    function makeItems() {
        return {
            items: [...items, ...ghostItems, ...highlights],
        };
    }

    function makeCreateIcon() {
        const maxIndex = getChildren(getParent(model)).length - 1;
        const Component = getIndex(model) === maxIndex ? PipeEnd : PipeMid;
        return {
            createIcon: (target: Element) => {
                return new Component({ target });
            },
        };
    }

    const vm = new TrackVM({
        ...makeLabel(),
        ...makeItems(),
        ...makeCreateIcon(),
        idPrefix: model.id,
    });

    model.subscribe((_, oldState) => {
        const updatedProps = compareStates(model.state, oldState);

        if (updatedProps.has("children")) remakeItems();

        vm.state = {
            ...(updatedProps.has("label") ? makeLabel() : {}),
            ...(updatedProps.has("children") ? makeItems() : {}),
        };
    });

    context.subscribe((_, oldState) => {
        const updatedProps = compareStates(context.state, oldState);

        if (updatedProps.has("ghostPairs")) remakeGhostItems();
        if (updatedProps.has("highlights")) remakeHighlights();

        vm.state = {
            ...makeItems(),
        };
    });

    return vm;
}
