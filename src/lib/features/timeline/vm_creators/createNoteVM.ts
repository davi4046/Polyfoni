import type TimelineContext from "../context/TimelineContext";
import type Item from "../models/Item";
import ItemVM from "../view_models/ItemVM";

export default function createNoteVM(
    model: Item<"NoteItem">,
    context: TimelineContext
) {
    const vm = new ItemVM(
        {
            start: model.state.start,
            end: model.state.end,
            styles: { "background-color": "black" },
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
