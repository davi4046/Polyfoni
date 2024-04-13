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
    getPosition,
    matchPosition,
} from "../../../../architecture/state-hierarchy-utils";
import type TrackGroup from "../../../models/track_group/TrackGroup";
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
        const label = matchPosition(getPosition(model), positionLabelMap);
        return { label: label ? label : "MISSING LABEL" };
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
        const hidden = matchPosition(getPosition(model), positionHiddenMap);
        return { hidden: hidden !== undefined ? hidden : true };
    }

    function compileMenu() {
        const createMenu = matchPosition(getPosition(model), positionMenuMap);
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
            ...(model.state.parent !== oldState.parent
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

const positionHiddenMap = new Map<string, boolean>([["1,*,1-*", false]]);

const positionLabelMap = new Map<string, string>([
    ["1,*,1", "Framework"],
    ["1,*,2-*", "Decoration"],
]);

const positionMenuMap = new Map<
    string,
    (model: TrackGroup, context: TimelineContext) => Menu
>([["1,*,2-*", createTrackGroupMenu]]);

function createTrackGroupMenu(
    model: TrackGroup,
    context: TimelineContext
): Menu {
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
}
