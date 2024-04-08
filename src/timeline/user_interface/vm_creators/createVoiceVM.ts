import type TimelineContext from "../context/TimelineContext";
import VoiceVM from "../view_models/VoiceVM";
import { getChildren } from "../../../architecture/state-hierarchy-utils";
import compareStates from "../../../utils/compareStates";
import type Voice from "../../models/voice/Voice";

import createItemTrackVM from "./createItemTrackVM";
import createNoteTrackVM from "./createNoteTrackVM";
import createTrackGroupVM from "./createTrackGroupVM";

export default function createVoiceVM(
    model: Voice,
    context: TimelineContext
): VoiceVM {
    function makeTrackGroups() {
        return {
            trackGroups: getChildren(model).map((trackGroup) =>
                createTrackGroupVM(trackGroup, context)
            ),
        };
    }

    const vm = new VoiceVM({
        ...makeTrackGroups(),
        isCollapsed: false,
    });

    model.subscribe((_, oldState) => {
        const updatedProps = compareStates(model.state, oldState);
        vm.state = {
            ...(updatedProps.has("children") ? makeTrackGroups() : {}),
        };
    });

    return vm;
}
