import type TimelineContext from "../context/TimelineContext";
import type Voice from "../models/voice/Voice";
import VoiceVM from "../view_models/voice/VoiceVM";
import { createVoiceVMState_bound } from "../view_models/voice/VoiceVMState_bound";
import { createVoiceVMState_unbound } from "../view_models/voice/VoiceVMState_unbound";
import createTrackVM from "./createTrackVM";

function createVoiceVM(model: Voice, context: TimelineContext): VoiceVM {
    const update = (model: Voice) => {
        const tracks = model.state.children.map((track) => {
            return createTrackVM(track, context);
        });

        return createVoiceVMState_bound({
            tracks: tracks,
        });
    };

    return new VoiceVM(model, update, createVoiceVMState_unbound({}));
}

export default createVoiceVM;
