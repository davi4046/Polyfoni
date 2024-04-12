import createHighlightVM from "../item_vm/createHighlightVM";
import createNoteVM from "../item_vm/createNoteVM";
import type TimelineContext from "../../context/TimelineContext";
import type ItemVM from "../../view_models/ItemVM";
import TrackVM from "../../view_models/TrackVM";
import createDecorationPass from "../../../utils/createDecorationPass";
import {
    getChildren,
    getGrandparent,
    getGreatGrandparent,
    getIndex,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import { moveElementDown, moveElementUp } from "../../../../utils/array-utils";
import { midiInstrumentFamilies } from "../../../../utils/midiInstrumentFamilies";
import type Track from "../../../models/track/Track";
import { Menu, MenuItem } from "../../../../utils/popup_menu/popup-menu-types";

import { deriveTrackLabel } from "./track-vm-common";

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
        return {
            label: deriveTrackLabel(model),
        };
    }

    function compileItems() {
        return {
            items: [...items, ...highlights],
        };
    }

    updateItems();
    updateHighlights();

    const vm = new TrackVM({
        ...compileLabel(),
        ...compileItems(),

        headerMenu: new Menu([
            new MenuItem("Move up", () => {
                const voiceGroup = getGreatGrandparent(model);
                const voiceIndex = getIndex(getGrandparent(model));

                if (voiceIndex === -1) return;

                const updatedChildren = voiceGroup.state.children.slice();
                moveElementUp(updatedChildren, voiceIndex);

                context.history.startAction("Move voice");
                voiceGroup.state = {
                    children: updatedChildren,
                };
                context.history.endAction();
            }),
            new MenuItem("Move down", () => {
                const voiceGroup = getGreatGrandparent(model);
                const voiceIndex = getIndex(getGrandparent(model));

                if (voiceIndex === -1) return;

                const updatedChildren = voiceGroup.state.children.slice();
                moveElementDown(updatedChildren, voiceIndex);

                context.history.startAction("Move voice");
                voiceGroup.state = {
                    children: updatedChildren,
                };
                context.history.endAction();
            }),
            new MenuItem("Add decoration pass", () => {
                context.history.startAction("Add decoration pass");
                createDecorationPass(getGrandparent(model));
                context.history.endAction();
            }),
            new MenuItem(
                "Change instrument",
                new Menu(
                    midiInstrumentFamilies
                        .flatMap((familiy) => familiy[1])
                        .map((instrumentName, index) => {
                            return new MenuItem(instrumentName, () => {
                                context.history.startAction(
                                    "Change voice instrument"
                                );
                                getGrandparent(model).state = {
                                    instrument: index,
                                };
                                context.history.endAction();
                            });
                        }),
                    { maxHeight: "154px", searchBar: true }
                )
            ),
            new MenuItem("Delete", () => {
                const voiceGroup = getGreatGrandparent(model);
                const voiceIndex = getIndex(getGrandparent(model));

                if (voiceIndex === -1) return;

                const updatedChildren = voiceGroup.state.children.slice();
                updatedChildren.splice(voiceIndex, 1);

                context.history.startAction("Delete voice");
                voiceGroup.state = {
                    children: updatedChildren,
                };
                context.history.endAction();
            }),
        ]),

        idPrefix: model.id,
    });

    model.subscribe((_, oldState) => {
        const hasChildrenChanged = model.state.children !== oldState.children;

        if (hasChildrenChanged) updateItems();

        vm.state = {
            ...(model.state.role !== oldState.role ? compileLabel() : {}),
            ...(hasChildrenChanged ? compileItems() : {}),
        };
    });

    context.subscribe((_, oldState) => {
        const hasHighlightsChanged =
            context.state.highlights !== oldState.highlights;

        if (hasHighlightsChanged) updateHighlights();

        vm.state = {
            ...(hasHighlightsChanged ? compileItems() : {}),
        };
    });

    return vm;
}
