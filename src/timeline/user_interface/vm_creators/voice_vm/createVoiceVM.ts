import createTrackGroupVM from "../track_group_vm/createTrackGroupVM";
import type TimelineContext from "../../context/TimelineContext";
import VoiceVM from "../../view_models/VoiceVM";
import { getChildren } from "../../../../architecture/state-hierarchy-utils";
import type Voice from "../../../models/voice/Voice";

export default function createVoiceVM(
    model: Voice,
    context: TimelineContext
): VoiceVM {
    function compileTrackGroups() {
        return {
            trackGroups: getChildren(model).map((trackGroup) =>
                createTrackGroupVM(trackGroup, context)
            ),
        };
    }

    const vm = new VoiceVM({
        ...compileTrackGroups(),
    });

    model.subscribe((_, oldState) => {
        vm.state = {
            ...(model.state.children !== oldState.children
                ? compileTrackGroups()
                : {}),
        };
    });

    return vm;
}
