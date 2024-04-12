import { itemEditors } from "../../item-type-config";
import createVoiceGroupVM from "../voice_group_vm/createVoiceGroupVM";
import createVoiceVM from "../voice_vm/createVoiceVM";
import TimelineContext from "../../context/TimelineContext";
import TimelineHandler from "../../event_handlers/TimelineHandler";
import TimelineVM from "../../view_models/TimelineVM";
import { globalEventListener } from "../../../../architecture/GlobalEventListener";
import {
    getChildren,
    getParent,
} from "../../../../architecture/state-hierarchy-utils";
import getHarmonyOfNotes from "../../../features/generation/getHarmonyOfNotes";
import { type ItemTypes } from "../../../models/item/ItemTypes";
import Timeline from "../../../models/timeline/Timeline";
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
                context.history.startAction("Edit item content");
                item.state = {
                    content: value,
                };
                context.history.endAction();
            },
        };

        const createItemEditor = (target: Element) => {
            // @ts-ignore
            const itemEditor = new ItemEditor({ target, props });

            const subscription = item.subscribe(() => {
                if (itemEditor.reflectChange !== undefined) {
                    if (!justUpdated) {
                        itemEditor.reflectChange(item.state.content);
                    }
                    justUpdated = false;
                } else {
                    subscription.unsubscribe();
                }
            });

            return itemEditor;
        };

        return { createItemEditor: createItemEditor };
    }

    const vm = new TimelineVM({
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

        idPrefix: model.id,
    });

    model.subscribe((_, oldState) => {
        vm.state = {
            ...(model.state.children !== oldState.children
                ? compileSections()
                : {}),
        };
    });

    context.subscribe((_, oldState) => {
        vm.state = {
            ...(context.state.highlights !== oldState.highlights
                ? compileDisplayHarmony()
                : {}),

            ...(context.state.selectedItems.findLast(() => true) !==
            oldState.selectedItems.findLast(() => true)
                ? compileCreateItemEditor()
                : {}),
        };
    });

    context.player.subscribe((_, oldState) => {
        vm.state = {
            ...(context.player.state.motion !== oldState.motion
                ? compilePlaybackMotion()
                : {}),
            ...(context.player.state.isPlaying !== oldState.isPlaying
                ? compileIsPlaying()
                : {}),
        };
    });

    return vm;
}
