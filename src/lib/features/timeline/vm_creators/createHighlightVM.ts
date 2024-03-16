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

            innerDivStyles: {
                "background-color": "blue",
                opacity: "0.5",
                "pointer-events": "none",
            },
            outerDivStyles: {
                "z-index": "10",
            },
        },
        model.id
    );

    return vm;
}
