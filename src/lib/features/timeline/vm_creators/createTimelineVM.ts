import TimelineContext from "../context/TimelineContext";
import Timeline from "../models/Timeline";
import TimelineHandler from "../mouse_event_handlers/TimelineHandler";
import TimelineVM from "../view_models/TimelineVM";
import mouseEventListener from "../../../shared/architecture/mouse_event_listener/MouseEventListener";

import createVoiceVM from "./createVoiceVM";

function createTimelineVM(
    model: Timeline,
    context: TimelineContext
): TimelineVM {
    const mouseEventHandler = new TimelineHandler(context);

    const createSections = () => {
        const top = model.state.children[0].state.children.map((voice) => {
            return createVoiceVM(voice, context);
        });

        const center = model.state.children[1].state.children.map((voice) => {
            return createVoiceVM(voice, context);
        });

        const bottom = model.state.children[2].state.children.map((voice) => {
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
