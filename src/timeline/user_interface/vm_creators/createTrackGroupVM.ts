import type TimelineContext from "../context/TimelineContext";
import TrackGroupVM from "../view_models/TrackGroupVM";
import { getChildren } from "../../../architecture/state-hierarchy-utils";
import compareStates from "../../../utils/compareStates";
import type TrackGroup from "../../models/track_group/TrackGroup";

import createItemTrackVM from "./createItemTrackVM";
import createNoteTrackVM from "./createNoteTrackVM";

export default function createTrackGroupVM(
    model: TrackGroup,
    context: TimelineContext
) {
    function makeLabel() {
        return { label: model.state.label };
    }

    function makeTracks() {
        return {
            tracks: getChildren(model).map((track) => {
                return track.itemType === "NoteItem"
                    ? createNoteTrackVM(track, context)
                    : createItemTrackVM(track, context);
            }),
        };
    }

    const vm = new TrackGroupVM({
        ...makeLabel(),
        ...makeTracks(),
    });

    model.subscribe((_, oldState) => {
        const updatedProps = compareStates(model.state, oldState);
        vm.state = {
            ...(updatedProps.has("label") ? makeLabel() : {}),
            ...(updatedProps.has("children") ? makeTracks() : {}),
        };
    });

    return vm;
}
