import type TimelineContext from "../../context/TimelineContext";
import createDecorationPass from "../../../utils/createDecorationPass";
import {
    addChildren,
    getChildren,
    getGrandparent,
    getIndex,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import { moveElementDown, moveElementUp } from "../../../../utils/array-utils";
import { midiInstrumentFamilies } from "../../../../utils/midiInstrumentFamilies";
import Track from "../../../models/track/Track";
import TrackGroup from "../../../models/track_group/TrackGroup";
import type Voice from "../../../models/voice/Voice";
import { Menu, MenuItem } from "../../../../utils/popup_menu/popup-menu-types";

export const roleLabelMap = new Map<string, (track: Track<any>) => string>([
    ["output", (track) => getGrandparent(track).state.label],

    ["pitch", (_) => "Pitch"],
    ["duration", (_) => "Duration"],
    ["rest", (_) => "Rest?"],
    ["harmony", (_) => "Harmony"],
    ["pitches", (_) => "Pitches"],
    ["fraction", (_) => "Fraction"],
    ["skip", (_) => "Skip?"],

    ["tempo", (_) => "Tempo"],
    ["scale", (_) => "Scale"],
    ["total", (_) => "Harmonic Sum"],
]);

export const roleMenuMap = new Map<
    string,
    (track: Track<any>, context: TimelineContext) => Menu
>([
    [
        "output",
        (track, context) => createVoiceMenu(getGrandparent(track), context),
    ],
]);

function createVoiceMenu(voice: Voice, context: TimelineContext): Menu {
    const voiceGroup = getParent(voice);
    const voiceIndex = getIndex(voice);
    const maxIndex = getChildren(getParent(voice)).length - 1;

    return new Menu([
        new MenuItem("Collapse", () => {
            const collapsed = context.state.collapsed
                .concat(getChildren(voice).slice(1))
                .filter((value, index, array) => {
                    return index === array.indexOf(value);
                });
            context.state = { collapsed };
        }),
        new MenuItem("Expand", () => {
            const collapsed = context.state.collapsed.filter((value) => {
                return !getChildren(voice).includes(value);
            });
            context.state = { collapsed };
        }),
        new MenuItem(
            "Move up",
            () => {
                if (voiceIndex === -1) return;

                const updatedChildren = voiceGroup.state.children.slice();
                moveElementUp(updatedChildren, voiceIndex);

                context.history.startAction();
                voiceGroup.state = {
                    children: updatedChildren,
                };
                context.history.endAction("Moved voice up");
            },
            { disabled: voiceIndex === 0 }
        ),
        new MenuItem(
            "Move down",
            () => {
                if (voiceIndex === -1) return;

                const updatedChildren = voiceGroup.state.children.slice();
                moveElementDown(updatedChildren, voiceIndex);

                context.history.startAction();
                voiceGroup.state = {
                    children: updatedChildren,
                };
                context.history.endAction("Moved voice down");
            },
            { disabled: voiceIndex === maxIndex }
        ),
        new MenuItem("Create Decoration Pass", () => {
            context.history.startAction();
            const trackGroup = new TrackGroup({
                parent: voice,
                children: [],
            });
            const track = new Track("StringItem", {
                parent: trackGroup,
                children: [],
                role: "pitches",
            });
            addChildren(trackGroup, track);
            addChildren(voice, trackGroup);
            context.history.endAction("Created Decoration Pass");
        }),
        new MenuItem(
            "Change instrument",
            new Menu(
                midiInstrumentFamilies
                    .flatMap((familiy) => familiy[1])
                    .map((instrumentName, index) => {
                        return new MenuItem(instrumentName, () => {
                            context.history.startAction();
                            voice.state = {
                                instrument: index,
                            };
                            context.history.endAction("Changed instrument");
                        });
                    }),
                { maxHeight: "154px", searchBar: true }
            )
        ),
        new MenuItem("Delete", () => {
            if (voiceIndex === -1) return;

            const updatedChildren = voiceGroup.state.children.slice();
            updatedChildren.splice(voiceIndex, 1);

            context.history.startAction();
            voiceGroup.state = {
                children: updatedChildren,
            };
            context.history.endAction("Deleted voice");
        }),
    ]);
}
