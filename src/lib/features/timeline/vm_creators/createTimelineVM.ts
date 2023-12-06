import TimelineContext from "../contexts/TimelineContext";
import Timeline from "../models/timeline/Timeline";
import findClosestTrack from "../utils/find_closest_track.ts/findClosestTrack";
import getBeatAtClientX from "../utils/get_beat_at_client_x/getBeatAtClientX";
import TimelineVM from "../view_models/timeline/TimelineVM";
import TimelineVMState from "../view_models/timeline/TimelineVMState";
import createTrackVM from "./createTrackVM";

function createTimelineVM(
    model: Timeline,
    context: TimelineContext
): TimelineVM {
    const update = (model: Timeline): TimelineVMState => {
        const center = model.voices.map((voice) => {
            return voice.tracks.map((track) => {
                return createTrackVM(track, context);
            });
        });

        const bottom = [[createTrackVM(model.harmonicSumTrack, context)]];

        const handleMouseDown = (event: MouseEvent) => {
            if (event.shiftKey) return;
            context.selection.deselectAll();
        };

        const handleMouseUp = () => {
            context.cursor.reportMouseUp(); //toggled on by ItemVM (see createItemVM)
        };

        const handleMouseMove = (event: MouseEvent) => {
            const hoveredBeat = getBeatAtClientX(model, event.clientX);
            const hoveredTrack = findClosestTrack(model, event.clientY);

            context.cursor.hoveredBeat = hoveredBeat;
            context.cursor.hoveredTrack = hoveredTrack;
        };

        return new TimelineVMState(
            [],
            center,
            bottom,
            handleMouseDown,
            handleMouseUp,
            handleMouseMove
        );
    };

    return new TimelineVM(model, update);
}

export default createTimelineVM;
