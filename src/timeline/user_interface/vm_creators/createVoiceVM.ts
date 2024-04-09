import type TimelineContext from "../context/TimelineContext";
import type TrackGroupVM from "../view_models/TrackGroupVM";
import VoiceVM from "../view_models/VoiceVM";
import { getChildren } from "../../../architecture/state-hierarchy-utils";
import type Voice from "../../models/voice/Voice";

import createTrackGroupVM from "./createTrackGroupVM";

export default function createVoiceVM(
    model: Voice,
    context: TimelineContext
): VoiceVM {
    let trackGroups: TrackGroupVM[] = [];

    function updateTrackGroups() {
        trackGroups = getChildren(model).map((trackGroup) =>
            createTrackGroupVM(trackGroup, context)
        );
    }

    function compileTrackGroups() {
        const isCollapsed = context.state.collapsedVoices.includes(model);
        return {
            trackGroups: trackGroups.slice(0, isCollapsed ? 1 : undefined),
        };
    }

    updateTrackGroups();

    const vm = new VoiceVM({
        ...compileTrackGroups(),
    });

    model.subscribe((_, oldState) => {
        const hasChildrenUpdated = model.state.children !== oldState.children;

        if (hasChildrenUpdated) updateTrackGroups();

        vm.state = {
            ...(hasChildrenUpdated ? compileTrackGroups() : {}),
        };
    });

    context.subscribe((_, oldState) => {
        vm.state = {
            ...(context.state.collapsedVoices !== oldState.collapsedVoices
                ? compileTrackGroups()
                : {}),
        };
    });

    return vm;
}
