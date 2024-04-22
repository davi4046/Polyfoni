import createHighlightVM from "../item_vm/createHighlightVM";
import createNoteVM from "../item_vm/createNoteVM";
import type TimelineContext from "../../context/TimelineContext";
import type ItemVM from "../../view_models/ItemVM";
import TrackVM from "../../view_models/TrackVM";
import {
    getChildren,
    getParent,
    getPosition,
    matchPositionToPath,
} from "../../../../architecture/state-hierarchy-utils";
import type Track from "../../../models/track/Track";

import { positionLabelMap, positionMenuMap } from "./track-vm-common";

export default function createNoteTrackVM(
    model: Track<"NoteItem">,
    context: TimelineContext
): TrackVM {
    let items: ItemVM[] = [];
    let highlights: ItemVM[] = [];

    function updateItems() {
        const pitches = getChildren(model).map(
            (noteItem) => noteItem.state.content
        );
        const uniquePitches = Array.from(new Set(pitches));
        uniquePitches.sort((a, b) => a - b);

        const height = 100 / uniquePitches.length;

        items = model.state.children.map((item) => {
            const noteVM = createNoteVM(item, context);

            const pitchIndex = uniquePitches.indexOf(item.state.content);
            const top = (uniquePitches.length - pitchIndex - 1) * height;

            const newStyles = Object.assign({}, noteVM.state.innerDivStyles);

            newStyles["height"] = `${height}%`;
            newStyles["top"] = `${top}%`;

            noteVM.state = {
                innerDivStyles: newStyles,
            };

            return noteVM;
        });
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
            items: [...items, ...highlights],
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
    updateHighlights();

    const vm = new TrackVM({
        ...compileLabel(),
        ...compileItems(),
        ...compileHeaderMenu(),

        idPrefix: model.id,
    });

    model.subscribe((oldState) => {
        const hasChildrenChanged = model.state.children !== oldState.children;

        if (hasChildrenChanged) updateItems();

        vm.state = {
            ...(hasChildrenChanged ? compileItems() : {}),
        };
    });

    context.subscribe((oldState) => {
        const hasHighlightsChanged =
            context.state.highlights !== oldState.highlights;

        if (hasHighlightsChanged) updateHighlights();

        vm.state = {
            ...(hasHighlightsChanged ? compileItems() : {}),
        };
    });

    return vm;
}
