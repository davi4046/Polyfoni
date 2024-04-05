import { itemEditors } from "../item-type-config";
import TimelineContext from "../context/TimelineContext";
import TimelineHandler from "../event_handlers/TimelineHandler";
import TimelineVM from "../view_models/TimelineVM";
import { globalEventListener } from "../../../architecture/GlobalEventListener";
import {
    getChildren,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import compareStates from "../../../utils/compareStates";
import getHarmonyOfNotes from "../../features/generation/getHarmonyOfNotes";
import { type ItemTypes } from "../../models/item/ItemTypes";
import Timeline from "../../models/timeline/Timeline";
import isOverlapping from "../../../utils/interval/is_overlapping/isOverlapping";

import createVoiceVM from "./createVoiceVM";

export default function createTimelineVM(
    model: Timeline,
    context: TimelineContext
): TimelineVM {
    const mouseEventHandler = new TimelineHandler(model, context);

    const createSections = () => {
        const top = getChildren(getChildren(model)[0]).map((voice) => {
            return createVoiceVM(voice, context);
        });

        const center = getChildren(getChildren(model)[1]).map((voice) => {
            return createVoiceVM(voice, context);
        });

        const bottom = getChildren(getChildren(model)[2]).map((voice) => {
            return createVoiceVM(voice, context);
        });

        return { top, center, bottom };
    };

    const vm = new TimelineVM({
        ...createSections(),

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

        playbackMotion: context.player.state.motion,
        isPlaying: context.player.state.isPlaying,

        idPrefix: model.id,
    });

    model.subscribe(() => {
        vm.state = { ...createSections() };
    });

    context.subscribe((_, oldState) => {
        const updatedProps = compareStates(context.state, oldState);

        if (updatedProps.has("highlights")) {
            const highlights = context.state.highlights.filter((highlight) => {
                return getParent(highlight).itemType === "NoteItem";
            });

            const notes = highlights.flatMap((highlight) => {
                return getChildren(getParent(highlight)).filter((noteItem) => {
                    return isOverlapping(noteItem.state, highlight.state);
                });
            });

            vm.state = {
                displayHarmony: getHarmonyOfNotes(notes),
            };
        }

        if (updatedProps.has("editItem")) {
            vm.state = {
                createItemEditor: getCreateItemEditor(context),
            };
        }
    });

    context.player.subscribe(() => {
        vm.state = {
            playbackMotion: context.player.state.motion,
            isPlaying: context.player.state.isPlaying,
        };
    });

    return vm;
}

function getCreateItemEditor(context: TimelineContext) {
    const item = context.state.editItem;
    const ItemEditor = itemEditors[item?.itemType as keyof ItemTypes];

    if (!item || !ItemEditor) return;

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

    return (target: Element | Document | ShadowRoot) => {
        // @ts-ignore
        const itemEditor = new ItemEditor({ target, props });

        const subscription = item.subscribe(() => {
            if (itemEditor.reflectChange) {
                if (!justUpdated) itemEditor.reflectChange(item.state.content);
            } else {
                subscription.unsubscribe();
            }
            justUpdated = false;
        });

        return itemEditor;
    };
}
