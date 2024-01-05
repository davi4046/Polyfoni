import type TimelineContext from "../context/TimelineContext";
import type Voice from "../models/voice/Voice";
import VoiceVM from "../view_models/voice/VoiceVM";
import { createVoiceVMState } from "../view_models/voice/VoiceVMState";
import createTrackVM from "./createTrackVM";

function createVoiceVM(model: Voice, context: TimelineContext): VoiceVM {
    const update = (model: Voice) => {
        const tracks = model.state.children.map((track) => {
            return createTrackVM(track, context);
        });

        return createVoiceVMState({
            tracks: tracks,
        });
    };

    return new VoiceVM(model, update, () => {
        return {};
    });
}

export default createVoiceVM;
