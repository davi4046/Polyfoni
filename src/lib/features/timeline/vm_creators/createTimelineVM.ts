import mouseEventListener from "../../../shared/architecture/mouse_event_listener/MouseEventListener";
import TimelineContext from "../context/TimelineContext";
import Timeline from "../models/timeline/Timeline";
import TimelineHandler from "../mouse_event_handlers/TimelineHandler";
import TimelineVM from "../view_models/timeline/TimelineVM";
import { createTimelineVMState } from "../view_models/timeline/TimelineVMState";
import createTrackVM from "./createTrackVM";
import createVoiceVM from "./createVoiceVM";

function createTimelineVM(
    model: Timeline,
    context: TimelineContext
): TimelineVM {
    const mouseEventHandler = new TimelineHandler(context);

    const update = (model: Timeline) => {
        const top = model.state.children[0].state.children.map((voice) => {
            return createVoiceVM(voice, context);
        });

        const center = model.state.children[1].state.children.map((voice) => {
            return createVoiceVM(voice, context);
        });

        const bottom = model.state.children[2].state.children.map((voice) => {
            return createVoiceVM(voice, context);
        });

        const handleMouseMove = (event: MouseEvent) => {
            mouseEventListener.handler = mouseEventHandler;
        };

        return createTimelineVMState({
            top: top,
            center: center,
            bottom: bottom,
            handleMouseMove: handleMouseMove,
        });
    };

    return new TimelineVM(model, update, () => {
        return {};
    });
}

export default createTimelineVM;
