import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import NoteVM from "../view_models/NoteVM";

export default function createNoteVM(
    model: Item<"NoteItem">,
    context: TimelineContext
) {
    const vm = new NoteVM(
        {
            start: model.state.start,
            end: model.state.end,
        },
        model.id
    );

    model.subscribe(() => {
        vm.state = {
            start: model.state.start,
            end: model.state.end,
        };
    });

    return vm;
}
