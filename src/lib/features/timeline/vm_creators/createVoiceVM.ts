import type TimelineContext from "../context/TimelineContext";
import type Voice from "../models/Voice";
import VoiceVM from "../view_models/VoiceVM";

import createNoteTrackVM from "./createNoteTrackVM";
import createTrackVM from "./createTrackVM";

export default function createVoiceVM(
    model: Voice,
    context: TimelineContext
): VoiceVM {
    const vm = new VoiceVM(
        {
            tracks: model.state.children.map((track) => {
                return track.itemType === "NoteItem"
                    ? createNoteTrackVM(track, context)
                    : createTrackVM(track, context);
            }),
            isCollapsed: false,
        },
        model.id
    );

    model.subscribe(() => {
        vm.state = {
            tracks: model.state.children.map((track) => {
                return track.itemType === "NoteItem"
                    ? createNoteTrackVM(track, context)
                    : createTrackVM(track, context);
            }),
        };
    });

    return vm;
}
