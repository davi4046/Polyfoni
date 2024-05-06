import { emit } from "@tauri-apps/api/event";

import { itemEditors } from "../../item-type-config";
import createVoiceGroupVM from "../voice_group_vm/createVoiceGroupVM";
import createVoiceVM from "../voice_vm/createVoiceVM";
import TimelineContext from "../../context/TimelineContext";
import TimelineHandler from "../../event_handlers/TimelineHandler";
import TimelineVM from "../../view_models/TimelineVM";
import { globalEventListener } from "../../../../architecture/GlobalEventListener";
import {
    addChildren,
    getChildren,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import getHarmonyOfNotes from "../../../features/generation/getHarmonyOfNotes";
import { createVoice } from "../../../features/import_export/createTimelineFromXMLFile";
import { type ItemTypes } from "../../../models/item/ItemTypes";
import Timeline from "../../../models/timeline/Timeline";
import Voice from "../../../models/voice/Voice";
import isOverlapping from "../../../../utils/interval/is_overlapping/isOverlapping";

export default function createTimelineVM(
    model: Timeline,
    context: TimelineContext
): TimelineVM {
    const mouseEventHandler = new TimelineHandler(model, context);

    function compileSections() {
        const top = createVoiceGroupVM(getChildren(model)[0], context);
        const center = createVoiceGroupVM(getChildren(model)[1], context);
        const bottom = createVoiceGroupVM(getChildren(model)[2], context);
        return { top, center, bottom };
    }

    function compilePlaybackMotion() {
        return {
            playbackMotion: context.player.state.motion,
        };
    }

    function compileIsPlaying() {
        return {
            isPlaying: context.player.state.isPlaying,
        };
    }

    function compileDisplayHarmony() {
        const highlights = context.state.highlights.filter((highlight) => {
            return getParent(highlight).itemType === "NoteItem";
        });

        const notes = highlights.flatMap((highlight) => {
            return getChildren(getParent(highlight)).filter((noteItem) => {
                return isOverlapping(noteItem.state, highlight.state);
            });
        });

        return {
            displayHarmony: getHarmonyOfNotes(notes),
        };
    }

    function compileCreateItemEditor() {
        const item = context.state.selectedItems.findLast(() => true);
        const ItemEditor = itemEditors[item?.itemType as keyof ItemTypes];

        if (!item || !ItemEditor) return { createItemEditor: undefined };

        let justUpdated = false;

        const props = {
            value: item.state.content,
            update: (value: any) => {
                // 1.
                justUpdated = true;

                // 2.
                context.history.startAction();
                item.state = {
                    content: value,
                };
                context.history.endAction("Updated item content");
            },
        };

        const createItemEditor = (target: Element) => {
            // @ts-ignore
            const itemEditor = new ItemEditor({ target, props });

            const unsubscribe = item.subscribe(() => {
                if (itemEditor.reflectChange !== undefined) {
                    if (!justUpdated) {
                        itemEditor.reflectChange(item.state.content);
                    }
                    justUpdated = false;
                } else {
                    unsubscribe();
                }
            });

            return itemEditor;
        };

        return { createItemEditor: createItemEditor };
    }

    function compileLength() {
        return {
            length: model.state.length,
        };
    }

    const vm = new TimelineVM({
        idPrefix: model.id,

        ...compileLength(),
        ...compileSections(),
        ...compilePlaybackMotion(),
        ...compileIsPlaying(),
        ...compileDisplayHarmony(),
        ...compileCreateItemEditor(),

        handleMouseMove: (event: MouseEvent) => {
            globalEventListener.handler = undefined;
            event.stopPropagation();
        },
        handleMouseMove_tracks: (event: MouseEvent) => {
            globalEventListener.handler = mouseEventHandler;
            event.stopPropagation();
        },

        onPlayButtonClick: (_) => context.player.startPlayback(),
        onPauseButtonClick: (_) => context.player.pausePlayback(),
        onStopButtonClick: (_) => context.player.resetPlayback(),

        onAddVoiceButtonClick: (_) => {
            const midVoiceGroup = getChildren(model)[1];

            const voiceCount = getChildren(midVoiceGroup).length;

            const voice = createVoice(midVoiceGroup, {
                "@label": `Voice ${voiceCount}`,
                "@instrument": 0,
            });

            addChildren(midVoiceGroup, voice);
        },

        setTimelineLength(newLength) {
            context.history.startAction();
            model.state = { length: newLength };
            context.history.endAction("Updated timeline length");
        },
    });

    model.subscribe((oldState, newState) => {
        vm.state = {
            ...(oldState.children !== newState.children
                ? compileSections()
                : {}),
            ...(oldState.length !== newState.length ? compileLength() : {}),
        };
    });

    context.subscribe((oldState, newState) => {
        vm.state = {
            ...(oldState.highlights !== newState.highlights
                ? compileDisplayHarmony()
                : {}),

            ...(oldState.selectedItems.findLast(() => true) !==
            newState.selectedItems.findLast(() => true)
                ? compileCreateItemEditor()
                : {}),
        };
    });

    context.player.subscribe((oldState, newState) => {
        vm.state = {
            ...(oldState.motion !== newState.motion
                ? compilePlaybackMotion()
                : {}),
            ...(oldState.isPlaying !== newState.isPlaying
                ? compileIsPlaying()
                : {}),
        };
    });

    return vm;
}
