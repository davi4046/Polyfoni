import createVoiceVM from "../voice_vm/createVoiceVM";
import type TimelineContext from "../../context/TimelineContext";
import VoiceGroupVM from "../../view_models/VoiceGroupVM";
import type VoiceGroup from "../../../models/voice_group/VoiceGroup";

export default function createVoiceGroupVM(
    model: VoiceGroup,
    context: TimelineContext
): VoiceGroupVM {
    function compileVoices() {
        return {
            voices: model.state.children.map((voice) =>
                createVoiceVM(voice, context)
            ),
        };
    }

    const vm = new VoiceGroupVM({
        ...compileVoices(),
    });

    model.subscribe((oldState) => {
        vm.state = {
            ...(model.state.children !== oldState.children
                ? compileVoices()
                : {}),
        };
    });

    return vm;
}
