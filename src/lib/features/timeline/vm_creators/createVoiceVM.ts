import createBoundModel from "../../../shared/architecture/model/createBoundModel";
import VoiceVM from "../view_models/voice/VoiceVM";
import { createVoiceVMState } from "../view_models/voice/VoiceVMState";
import createTrackVM from "./createTrackVM";

import type TimelineContext from "../context/TimelineContext";
import type Voice from "../models/voice/Voice";

function createVoiceVM(model: Voice, context: TimelineContext): VoiceVM {
    return createBoundModel(VoiceVM, model, () => {
        const tracks = model.state.children.map((track) => {
            return createTrackVM(track, context);
        });

        return createVoiceVMState({
            tracks: tracks,
        });
    });
}

export default createVoiceVM;
