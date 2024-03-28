import type { Props } from "tippy.js";

import type TimelineContext from "../context/TimelineContext";
import ItemVM from "../view_models/ItemVM";
import pitchNames, {
    getPitchName,
    getPitchOctave,
} from "../../utils/pitchNames";
import type Item from "../../models/item/Item";

export default function createNoteVM(
    model: Item<"NoteItem">,
    context: TimelineContext
) {
    function createTooltip(): Partial<Props> {
        return {
            content: `${
                getPitchName(model.state.content) +
                getPitchOctave(model.state.content)
            } (${model.state.content})`,
            theme: "material",
        };
    }

    const vm = new ItemVM(
        {
            start: model.state.start,
            end: model.state.end,
            tooltip: createTooltip(),

            innerDivStyles: {
                "background-color": "black",
                "margin-left": "2px",
                "margin-right": "2px",
            },
        },
        model.id
    );

    model.subscribe(() => {
        vm.state = {
            start: model.state.start,
            end: model.state.end,
            tooltip: createTooltip(),
        };
    });

    context.player.subscribe(() => {
        const isPlaying = context.player.state.playingNotes.includes(model);
        const alteredStyles = Object.assign({}, vm.state.innerDivStyles);
        alteredStyles["background-color"] = isPlaying ? "blue" : "black";

        vm.state = {
            innerDivStyles: alteredStyles,
        };
    });

    return vm;
}
