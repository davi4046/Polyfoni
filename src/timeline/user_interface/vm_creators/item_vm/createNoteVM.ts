import type { Props } from "tippy.js";

import type TimelineContext from "../../context/TimelineContext";
import ItemVM from "../../view_models/ItemVM";
import pitchNames, {
    getPitchName,
    getPitchOctave,
} from "../../../utils/pitchNames";
import type Item from "../../../models/item/Item";

export default function createNoteVM(
    model: Item<"NoteItem">,
    context: TimelineContext
) {
    function compileStart() {
        return {
            start: model.state.start,
        };
    }

    function compileEnd() {
        return {
            end: model.state.end,
        };
    }

    function compileTooltip() {
        return {
            tooltip: {
                content: `${
                    getPitchName(model.state.content.pitch) +
                    getPitchOctave(model.state.content.pitch)
                } (${model.state.content.pitch}) - ${model.state.content.type}`,
                theme: "default",
            },
        };
    }

    const vm = new ItemVM({
        ...compileStart(),
        ...compileEnd(),
        ...compileTooltip(),

        innerDivStyles: {
            "background-color": "black",
            "margin-left": "2px",
            "margin-right": "2px",
        },
    });

    model.subscribe((oldState, newState) => {
        vm.state = {
            ...(oldState.start !== newState.start ? compileStart() : {}),
            ...(oldState.end !== newState.end ? compileEnd() : {}),
            ...(oldState.content !== newState.content ? compileTooltip() : {}),
        };
    });

    return vm;
}
