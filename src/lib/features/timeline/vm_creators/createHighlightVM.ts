import type TimelineContext from "../context/TimelineContext";
import type Highlight from "../models/Highlight";
import ItemVM from "../view_models/ItemVM";

export default function createHighlightVM(
    model: Highlight,
    context: TimelineContext
): ItemVM {
    const vm = new ItemVM(
        {
            start: model.state.start,
            end: model.state.end,

            styles: {
                "background-color": "blue",
                "pointer-events": "none",
            },
        },
        model.id
    );

    return vm;
}
