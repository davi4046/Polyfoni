import { itemEditors } from "../item-type-config";
import TimelineContext from "../context/TimelineContext";
import TimelineHandler from "../mouse_event_handlers/TimelineHandler";
import TimelineVM from "../view_models/TimelineVM";
import { mouseEventListener } from "../../../architecture/mouse-event-handling";
import { getChildren } from "../../../architecture/state-hierarchy-utils";
import compareStates from "../../../utils/compareStates";
import { SvelteCtorMatchProps } from "../../../utils/svelte-utils";
import analyzeHighlights from "../../features/generation/analyzeHighlights";
import type Item from "../../models/item/Item";
import { type ItemTypes } from "../../models/item/ItemTypes";
import Timeline from "../../models/timeline/Timeline";

import createVoiceVM from "./createVoiceVM";

export default function createTimelineVM(
    model: Timeline,
    context: TimelineContext
): TimelineVM {
    const mouseEventHandler = new TimelineHandler(context);

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

    const vm = new TimelineVM(
        {
            ...createSections(),

            handleMouseMove: (event: MouseEvent) => {
                mouseEventListener.handler = undefined;
                event.stopPropagation();
            },
            handleMouseMove_tracks: (event: MouseEvent) => {
                mouseEventListener.handler = mouseEventHandler;
                event.stopPropagation();
            },

            onPlayButtonClick: (_) => context.player.startPlayback(),
            onPauseButtonClick: (_) => context.player.pausePlayback(),
            onStopButtonClick: (_) => context.player.resetPlayback(),

            playbackMotion: context.player.state.motion,
            isPlaying: context.player.state.isPlaying,
        },
        model.id
    );

    model.subscribe(() => {
        vm.state = { ...createSections() };
    });

    context.subscribe((_, oldState) => {
        const updatedProps = compareStates(context.state, oldState);

        if (updatedProps.has("highlights")) {
            vm.state = {
                analysis: analyzeHighlights(context.state.highlights),
            };
        }

        if (updatedProps.has("editItem")) {
            const EditorWidgetCtor =
                itemEditors[
                    context.state.editItem?.itemType as keyof ItemTypes
                ];

            if (EditorWidgetCtor && context.state.editItem) {
                vm.state = {
                    editorWidget: new SvelteCtorMatchProps<{ item: Item<any> }>(
                        EditorWidgetCtor,
                        {
                            item: context.state.editItem,
                        }
                    ),
                };
            } else {
                vm.state = {
                    editorWidget: undefined,
                };
            }
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
