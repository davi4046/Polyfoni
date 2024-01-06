import createBoundModel from "../../../shared/architecture/model/createBoundModel";
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

    const handleMouseMove_tracks = (event: MouseEvent) => {
        mouseEventListener.handler = mouseEventHandler;
        event.stopPropagation();
    };

    const handleMouseMove_others = (event: MouseEvent) => {
        mouseEventListener.handler = undefined;
        event.stopPropagation();
    };

    return createBoundModel(TimelineVM, model, () => {
        const top = model.state.children[0].state.children.map((voice) => {
            return createVoiceVM(voice, context);
        });

        const center = model.state.children[1].state.children.map((voice) => {
            return createVoiceVM(voice, context);
        });

        const bottom = model.state.children[2].state.children.map((voice) => {
            return createVoiceVM(voice, context);
        });

        return createTimelineVMState({
            top: top,
            center: center,
            bottom: bottom,
            handleMouseMove_tracks: handleMouseMove_tracks,
            handleMouseMove_others: handleMouseMove_others,
        });
    });
}

export default createTimelineVM;
