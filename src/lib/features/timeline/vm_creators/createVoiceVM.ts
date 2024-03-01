import type TimelineContext from "../context/TimelineContext";
import type Voice from "../models/Voice";
import VoiceVM from "../view_models/voice/VoiceVM";
import { createVoiceVMState } from "../view_models/voice/VoiceVMState";

import createTrackVM from "./createTrackVM";

function createVoiceVM(model: Voice, context: TimelineContext): VoiceVM {
    const vm = new VoiceVM(
        createVoiceVMState({
            tracks: model.state.children.map((track) => {
                return createTrackVM(track, context);
            }),
        }),
        model.id
    );

    model.subscribe(() => {
        vm.state = {
            tracks: model.state.children.map((track) => {
                return createTrackVM(track, context);
            }),
        };
    });

    return vm;
}

export default createVoiceVM;
