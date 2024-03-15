import type TimelineContext from "../context/TimelineContext";
import type Track from "../models/Track";
import { NoteTrackVM } from "../view_models/TrackVM";

import createNoteVM from "./createNoteVM";

export default function createNoteTrackVM(
    model: Track<"NoteItem">,
    context: TimelineContext
): NoteTrackVM {
    const createItems = () => {
        return model.state.children.map((item) => {
            return createNoteVM(item, context);
        });
    };

    const vm = new NoteTrackVM(
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

    return vm;
}
