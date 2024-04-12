import createItemTrackVM from "../track_vm/createItemTrackVM";
import createNoteTrackVM from "../track_vm/createNoteTrackVM";
import type TimelineContext from "../../context/TimelineContext";
import TrackGroupVM from "../../view_models/TrackGroupVM";
import type TrackVM from "../../view_models/TrackVM";
import ArrowDropDownButton from "../../visuals/buttons/ArrowDropDownButton.svelte";
import { getChildren } from "../../../../architecture/state-hierarchy-utils";
import type TrackGroup from "../../../models/track_group/TrackGroup";
import type { TrackGroupRole } from "../../../models/track_group/TrackGroup";
import { Menu, MenuItem } from "../../../../utils/popup_menu/popup-menu-types";

export default function createTrackGroupVM(
    model: TrackGroup,
    context: TimelineContext
): TrackGroupVM {
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
        return { label: trackGroupLabels[model.state.role] };
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

    function compileHidden() {
        return { hidden: hiddenTrackGroupRoles.includes(model.state.role) };
    }

    updateTracks();

    const vm = new TrackGroupVM({
        ...compileLabel(),
        ...compileTracks(),
        ...compileIconCreator(),
        ...compileHidden(),

        headerMenu: new Menu([new MenuItem("hej", () => {})]),
    });

    model.subscribe((_, oldState) => {
        if (model.state.children !== oldState.children) updateTracks();

        vm.state = {
            ...(model.state.role !== oldState.role ? compileLabel() : {}),
            ...(model.state.role !== oldState.role ? compileHidden() : {}),
            ...(model.state.children !== oldState.children
                ? compileTracks()
                : {}),
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

const hiddenTrackGroupRoles: TrackGroupRole[] = [
    "timeline_settings",
    "timeline_analysis",
    "voice_output",
] as const;

const trackGroupLabels: { [K in TrackGroupRole]: string } = {
    timeline_settings: "Settings",
    timeline_analysis: "Analysis",
    voice_output: "Output",
    voice_framework: "Framework",
    voice_decoration: "Decoration",
} as const;
