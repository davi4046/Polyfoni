import chroma from "chroma-js";

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

            text: "",
            opacity: 1,
            bgColor: chroma.hcl(0, 0, 80),
            olColor: chroma.hcl(0, 0, 0, 0),

            handleMouseMove: () => {},
            handleMouseMove_endHandle: () => {},
            handleMouseMove_startHandle: () => {},
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
