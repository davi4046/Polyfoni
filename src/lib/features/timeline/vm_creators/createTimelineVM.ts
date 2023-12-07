import ViewModel from '../../../shared/view_model/ViewModel';
import TimelineContext from '../contexts/TimelineContext';
import Timeline from '../models/timeline/Timeline';
import findClosestTrack from '../utils/find_closest_track.ts/findClosestTrack';
import getBeatAtClientX from '../utils/get_beat_at_client_x/getBeatAtClientX';
import { createTimelineVMState } from '../view_models/timeline/TimelineVMState';
import createTrackVM from './createTrackVM';

import type TimelineVM from "../view_models/timeline/TimelineVM";

function createTimelineVM(
    model: Timeline,
    context: TimelineContext
): TimelineVM {
    const update = (model: Timeline) => {
        const center = model.center.voices.map((voice) => {
            return voice.tracks.map((track) => {
                return createTrackVM(track, context);
            });
        });

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

        return createTimelineVMState({
            center: center,
            handleMouseDown: handleMouseDown,
            handleMouseUp: handleMouseUp,
            handleMouseMove: handleMouseMove,
        });
    };

    return ViewModel.create(model, update);
}

export default createTimelineVM;
