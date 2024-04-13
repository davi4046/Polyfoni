import type TimelineContext from "../../context/TimelineContext";
import createDecorationPass from "../../../utils/createDecorationPass";
import {
    getGrandparent,
    getIndex,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import { moveElementDown, moveElementUp } from "../../../../utils/array-utils";
import { midiInstrumentFamilies } from "../../../../utils/midiInstrumentFamilies";
import type Track from "../../../models/track/Track";
import type Voice from "../../../models/voice/Voice";
import { Menu, MenuItem } from "../../../../utils/popup_menu/popup-menu-types";

export const positionLabelMap = new Map<string, (track: Track<any>) => string>([
    ["0,*,*,0", (_) => "Tempo"],
    ["0,*,*,1", (_) => "Scale"],
    ["1,*,0,0", (track) => getGrandparent(track).state.label],
    ["1,*,1,0", (_) => "Pitch"],
    ["1,*,1,1", (_) => "Duration"],
    ["1,*,1,2", (_) => "Rest?"],
    ["1,*,1,3", (_) => "Harmony"],
    ["1,*,2-*,0", (_) => "Pitches"],
    ["1,*,2-*,1", (_) => "Fraction"],
    ["1,*,2-*,2", (_) => "Skip?"],
    ["1,*,2-*,3", (_) => "Harmony"],
    ["2,*,*,0", (_) => "Harmonic Sum"],
]);

export const positionMenuMap = new Map<
    string,
    (track: Track<any>, context: TimelineContext) => Menu
>([
    [
        "1,*,0,0",
        (track, context) => createVoiceMenu(getGrandparent(track), context),
    ],
]);

function createVoiceMenu(voice: Voice, context: TimelineContext): Menu {
    const menu: Menu = new Menu([
        new MenuItem("Move up", () => {
            const voiceGroup = getParent(voice);
            const voiceIndex = getIndex(voice);

            if (voiceIndex === -1) return;

            const updatedChildren = voiceGroup.state.children.slice();
            moveElementUp(updatedChildren, voiceIndex);

            context.history.startAction("Move voice");
            voiceGroup.state = {
                children: updatedChildren,
            };
            context.history.endAction();
        }),
        new MenuItem("Move down", () => {
            const voiceGroup = getParent(voice);
            const voiceIndex = getIndex(voice);

            if (voiceIndex === -1) return;

            const updatedChildren = voiceGroup.state.children.slice();
            moveElementDown(updatedChildren, voiceIndex);

            context.history.startAction("Move voice");
            voiceGroup.state = {
                children: updatedChildren,
            };
            context.history.endAction();
        }),
        new MenuItem("Add decoration pass", () => {
            context.history.startAction("Add decoration pass");
            createDecorationPass(voice);
            context.history.endAction();
        }),
        new MenuItem(
            "Change instrument",
            new Menu(
                midiInstrumentFamilies
                    .flatMap((familiy) => familiy[1])
                    .map((instrumentName, index) => {
                        return new MenuItem(instrumentName, () => {
                            context.history.startAction(
                                "Change voice instrument"
                            );
                            voice.state = {
                                instrument: index,
                            };
                            context.history.endAction();
                        });
                    }),
                { maxHeight: "154px", searchBar: true }
            )
        ),
        new MenuItem("Delete", () => {
            const voiceGroup = getParent(voice);
            const voiceIndex = getIndex(voice);

            if (voiceIndex === -1) return;

            const updatedChildren = voiceGroup.state.children.slice();
            updatedChildren.splice(voiceIndex, 1);

            context.history.startAction("Delete voice");
            voiceGroup.state = {
                children: updatedChildren,
            };
            context.history.endAction();
        }),
    ]);
    return menu;
}
