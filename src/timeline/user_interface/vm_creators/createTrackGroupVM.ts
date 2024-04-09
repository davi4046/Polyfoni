import type TimelineContext from "../context/TimelineContext";
import TrackGroupVM from "../view_models/TrackGroupVM";
import type TrackVM from "../view_models/TrackVM";
import ArrowDropDownButton from "../visuals/buttons/ArrowDropDownButton.svelte";
import { getChildren } from "../../../architecture/state-hierarchy-utils";
import type TrackGroup from "../../models/track_group/TrackGroup";

import createItemTrackVM from "./createItemTrackVM";
import createNoteTrackVM from "./createNoteTrackVM";

export default function createTrackGroupVM(
    model: TrackGroup,
    context: TimelineContext
) {
    let tracks: TrackVM[] = [];

    function updateTracks() {
        tracks = getChildren(model).map((track) => {
            return track.itemType === "NoteItem"
                ? createNoteTrackVM(track, context)
                : createItemTrackVM(track, context);
        });
    }

    function compileTracks() {
        const isCollapsed = context.state.collapsed.includes(model);

        return {
            tracks: isCollapsed ? [] : tracks,
        };
    }

    function compileLabel() {
        return { label: model.state.label };
    }

    function compileIconCreator() {
        return {
            createIcon: (target: Element) => {
                const value = context.state.collapsed.includes(model);

                const onToggle = (value: boolean) => {
                    context.state = {
                        collapsed: value
                            ? context.state.collapsed.concat(model)
                            : context.state.collapsed.filter(
                                  (trackGroup) => trackGroup !== model
                              ),
                    };
                };

                return new ArrowDropDownButton({
                    target,
                    props: {
                        value,
                        onToggle,
                    },
                });
            },
        };
    }

    updateTracks();

    const vm = new TrackGroupVM({
        ...compileLabel(),
        ...compileTracks(),
        ...compileIconCreator(),
    });

    model.subscribe((_, oldState) => {
        const hasChildrenUpdated = model.state.children !== oldState.children;

        if (hasChildrenUpdated) updateTracks();

        vm.state = {
            ...(model.state.label !== oldState.label ? compileLabel() : {}),
            ...(hasChildrenUpdated ? compileTracks() : {}),
        };
    });

    context.subscribe((_, oldState) => {
        vm.state = {
            ...(context.state.collapsed !== oldState.collapsed
                ? compileTracks()
                : {}),
        };
    });

    return vm;
}
