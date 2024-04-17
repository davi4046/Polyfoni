import createHighlightVM from "../item_vm/createHighlightVM";
import createItemVM from "../item_vm/createItemVM";
import createItemVM_ghost from "../item_vm/createItemVM_ghost";
import type TimelineContext from "../../context/TimelineContext";
import type ItemVM from "../../view_models/ItemVM";
import TrackVM from "../../view_models/TrackVM";
import PipeEnd from "../../visuals/icons/PipeEnd.svelte";
import PipeMid from "../../visuals/icons/PipeMid.svelte";
import {
    getChildren,
    getIndex,
    getParent,
    getPosition,
    matchPositionToPath,
} from "../../../../architecture/state-hierarchy-utils";
import type Track from "../../../models/track/Track";

import { positionLabelMap, positionMenuMap } from "./track-vm-common";

export default function createItemTrackVM(
    model: Track<"StringItem" | "ChordItem">,
    context: TimelineContext
): TrackVM {
    let items: ItemVM[] = [];
    let ghostItems: ItemVM[] = [];
    let highlights: ItemVM[] = [];

    function updateItems() {
        items = model.state.children.map((item) => {
            return createItemVM(item, context);
        });
    }

    function updateGhostItems() {
        ghostItems = context.state.ghostPairs
            .map((pair) => pair[1])
            .filter((item) => item.state.parent === model)
            .map((item) => createItemVM_ghost(item, context));
    }

    function updateHighlights() {
        highlights = context.state.highlights
            .filter((highlight) => getParent(highlight) === model)
            .map((highlight) => createHighlightVM(highlight, context));
    }

    function compileLabel() {
        const createLabel = matchPositionToPath(
            getPosition(model),
            positionLabelMap
        );
        return {
            label: createLabel ? createLabel(model) : "MISSING LABEL",
        };
    }

    function compileItems() {
        return {
            items: [...items, ...ghostItems, ...highlights],
        };
    }

    function compileCreateIcon() {
        const maxIndex = getChildren(getParent(model)).length - 1;
        const Component = getIndex(model) === maxIndex ? PipeEnd : PipeMid;
        return {
            createIcon: (target: Element) => {
                return new Component({ target });
            },
        };
    }

    function compileHeaderMenu() {
        const createMenu = matchPositionToPath(
            getPosition(model),
            positionMenuMap
        );
        return {
            headerMenu: createMenu ? createMenu(model, context) : undefined,
        };
    }

    updateItems();
    updateGhostItems();
    updateHighlights();

    const vm = new TrackVM({
        ...compileLabel(),
        ...compileItems(),
        ...compileCreateIcon(),
        ...compileHeaderMenu(),

        idPrefix: model.id,
    });

    model.subscribe((_, oldState) => {
        const hasChildrenChanged = model.state.children !== oldState.children;

        if (hasChildrenChanged) updateItems();

        vm.state = {
            ...(hasChildrenChanged ? compileItems() : {}),
        };
    });

    context.subscribe((_, oldState) => {
        const hasGhostPairsChanged =
            context.state.ghostPairs !== oldState.ghostPairs;
        const hasHighlightsChanged =
            context.state.highlights !== oldState.highlights;

        if (hasGhostPairsChanged) updateGhostItems();
        if (hasHighlightsChanged) updateHighlights();

        vm.state = {
            ...(hasGhostPairsChanged || hasHighlightsChanged
                ? compileItems()
                : {}),
        };
    });

    return vm;
}
