import TimelineContext from "../context/TimelineContext";
import Timeline from "../models/Timeline";
import TimelineHandler from "../mouse_event_handlers/TimelineHandler";
import TimelineVM from "../view_models/TimelineVM";
import { mouseEventListener } from "../../../architecture/mouse-event-handling";
import { getChildren } from "../../../architecture/state-hierarchy-utils";

import createVoiceVM from "./createVoiceVM";

function createTimelineVM(
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

    const { top, center, bottom } = createSections();

    const vm = new TimelineVM(
        {
            top: top,
            center: center,
            bottom: bottom,

            handleMouseMove_tracks: (event: MouseEvent) => {
                mouseEventListener.handler = mouseEventHandler;
                event.stopPropagation();
            },
            handleMouseMove_others: (event: MouseEvent) => {
                mouseEventListener.handler = undefined;
                event.stopPropagation();
            },
        },
        model.id
    );

    model.subscribe(() => {
        const { top, center, bottom } = createSections();

        vm.state = {
            top: top,
            center: center,
            bottom: bottom,
        };
    });

    return vm;
}

export default createTimelineVM;
