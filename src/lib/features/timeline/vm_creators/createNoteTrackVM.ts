import type TimelineContext from "../context/TimelineContext";
import type Track from "../models/Track";
import TrackVM from "../view_models/TrackVM";
import { getChildren } from "../../../architecture/state-hierarchy-utils";

import createNoteVM from "./createNoteVM";

export default function createNoteTrackVM(
    model: Track<"NoteItem">,
    context: TimelineContext
): TrackVM {
    const createItems = () => {
        const pitches = Array.from(
            new Set(
                getChildren(model).map((noteItem) => noteItem.state.content)
            )
        );

        const height = 100 / pitches.length;

        const items = model.state.children.map((item) => {
            const noteVM = createNoteVM(item, context);

            const pitchIndex = pitches.indexOf(item.state.content);
            const top = (pitches.length - pitchIndex - 1) * height;

            const newStyles = Object.assign({}, noteVM.state.styles);

            newStyles["height"] = `${height}%`;
            newStyles["top"] = `${top}%`;

            noteVM.state = {
                styles: newStyles,
            };

            return noteVM;
        });

        return items;
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
