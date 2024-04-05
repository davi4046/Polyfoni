import type TimelineContext from "../context/TimelineContext";
import VoiceVM from "../view_models/VoiceVM";
import type Voice from "../../models/voice/Voice";

import createItemTrackVM from "./createItemTrackVM";
import createNoteTrackVM from "./createNoteTrackVM";

export default function createVoiceVM(
    model: Voice,
    context: TimelineContext
): VoiceVM {
    const vm = new VoiceVM({
        tracks: model.state.children.map((track) => {
            return track.itemType === "NoteItem"
                ? createNoteTrackVM(track, context)
                : createItemTrackVM(track, context);
        }),
        isCollapsed: false,
    });

    model.subscribe(() => {
        vm.state = {
            tracks: model.state.children.map((track) => {
                return track.itemType === "NoteItem"
                    ? createNoteTrackVM(track, context)
                    : createItemTrackVM(track, context);
            }),
        };
    });

    return vm;
}
