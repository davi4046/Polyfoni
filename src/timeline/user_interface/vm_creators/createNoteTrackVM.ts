import type TimelineContext from "../context/TimelineContext";
import type ItemVM from "../view_models/ItemVM";
import TrackVM from "../view_models/TrackVM";
import ArrowDown from "../visuals/icons/ArrowDown.svelte";
import ArrowRight from "../visuals/icons/ArrowRight.svelte";
import Button from "../visuals/utils/Button.svelte";
import {
    getChildren,
    getGrandparent,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import type Track from "../../models/track/Track";

import createHighlightVM from "./createHighlightVM";
import createNoteVM from "./createNoteVM";

export default function createNoteTrackVM(
    model: Track<"NoteItem">,
    context: TimelineContext
): TrackVM {
    let items: ItemVM[] = [];
    let highlights: ItemVM[] = [];

    function remakeItems() {
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

    function remakeHighlights() {
        highlights = context.state.highlights
            .filter((highlight) => getParent(highlight) === model)
            .map((highlight) => createHighlightVM(highlight, context));
    }

    remakeItems();
    remakeHighlights();

    function makeCreateIcon() {
        let isCollapsed = context.state.collapsedVoices.includes(
            getGrandparent(model)
        );

        const props = isCollapsed
            ? {
                  createContent: (target: Element) =>
                      new ArrowRight({ target }),
                  onClick: () => {
                      // 1.
                      context.state = {
                          collapsedVoices: context.state.collapsedVoices.filter(
                              (voice) => voice !== getGrandparent(model)
                          ),
                      };
                      // 2.
                      vm.state = {
                          ...makeCreateIcon(),
                      };
                  },
              }
            : {
                  createContent: (target: Element) => new ArrowDown({ target }),
                  onClick: () => {
                      // 1.
                      context.state = {
                          collapsedVoices: context.state.collapsedVoices.concat(
                              getGrandparent(model)
                          ),
                      };
                      // 2.
                      vm.state = {
                          ...makeCreateIcon(),
                      };
                  },
              };

        return {
            createIcon: (target: Element) => new Button({ target, props }),
        };
    }

    const vm = new TrackVM({
        label: model.state.label,
        items: [...items, ...highlights],

        ...makeCreateIcon(),

        idPrefix: model.id,
    });

    model.subscribe((_, oldState) => {
        if (model.state.children !== oldState.children) remakeItems();

        vm.state = {
            label: model.state.label,
            items: [...items, ...highlights],
        };
    });

    context.subscribe((_, oldState) => {
        if (context.state.highlights !== oldState.highlights)
            remakeHighlights();

        vm.state = {
            items: [...items, ...highlights],
        };
    });

    return vm;
}
