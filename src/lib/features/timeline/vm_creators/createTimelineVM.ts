import TimelineContext from "../contexts/TimelineContext";
import Timeline from "../models/timeline/Timeline";
import TimelineVM from "../view_models/timeline/TimelineVM";
import { createTimelineVMState } from "../view_models/timeline/TimelineVMState";
import createTrackVM from "./createTrackVM";

function createTimelineVM(
    model: Timeline,
    context: TimelineContext
): TimelineVM {
    const update = (model: Timeline) => {
        const top = model.state.children[0].state.children.map((voice) => {
            return voice.state.children.map((track) => {
                return createTrackVM(track, context);
            });
        });

        const center = model.state.children[1].state.children.map((voice) => {
            return voice.state.children.map((track) => {
                return createTrackVM(track, context);
            });
        });

        const bottom = model.state.children[2].state.children.map((voice) => {
            return voice.state.children.map((track) => {
                return createTrackVM(track, context);
            });
        });

        const handleMouseDown = (event: MouseEvent) => {
            if (event.shiftKey) return;
            context.selection.deselectAll();
        };

        return createTimelineVMState({
            top: top,
            center: center,
            bottom: bottom,
            handleMouseDown: handleMouseDown,
        });
    };

    return new TimelineVM(model, update);
}

export default createTimelineVM;
