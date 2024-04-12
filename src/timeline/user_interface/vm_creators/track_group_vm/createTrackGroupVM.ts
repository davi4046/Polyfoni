import createItemTrackVM from "../track_vm/createItemTrackVM";
import createNoteTrackVM from "../track_vm/createNoteTrackVM";
import type TimelineContext from "../../context/TimelineContext";
import TrackGroupVM from "../../view_models/TrackGroupVM";
import type TrackVM from "../../view_models/TrackVM";
import ArrowDropDownButton from "../../visuals/buttons/ArrowDropDownButton.svelte";
import {
    getChildren,
    getIndex,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
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
        return { label: roleToLabel[model.state.role] };
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

    function compileMenu() {
        const createMenu = roleToMenuCreator[model.state.role];
        return {
            headerMenu: createMenu ? createMenu(model, context) : undefined,
        };
    }

    updateTracks();

    const vm = new TrackGroupVM({
        ...compileLabel(),
        ...compileTracks(),
        ...compileIconCreator(),
        ...compileHidden(),
        ...compileMenu(),
    });

    model.subscribe((_, oldState) => {
        if (model.state.children !== oldState.children) updateTracks();

        vm.state = {
            ...(model.state.role !== oldState.role
                ? { ...compileLabel(), ...compileHidden, ...compileMenu }
                : {}),
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

const roleToLabel: { [K in TrackGroupRole]: string } = {
    timeline_settings: "Settings",
    timeline_analysis: "Analysis",
    voice_output: "Output",
    voice_framework: "Framework",
    voice_decoration: "Decoration",
} as const;

const roleToMenuCreator: Partial<{
    [K in TrackGroupRole]: (
        model: TrackGroup,
        context: TimelineContext
    ) => Menu;
}> = {
    voice_decoration: (model, context) => {
        return new Menu([
            new MenuItem("Delete", () => {
                const voice = getParent(model);
                const index = getIndex(model);

                if (index === -1) return;

                const updatedChildren = voice.state.children.slice();
                updatedChildren.splice(index, 1);

                context.history.startAction("Delete decoration pass");
                voice.state = {
                    children: updatedChildren,
                };
                context.history.endAction();
            }),
        ]);
    },
};
