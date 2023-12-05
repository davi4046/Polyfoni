import chroma from "chroma-js";

import Track from "../models/track/Track";
import findClosestTrack from "../utils/find_closest_track.ts/findClosestTrack";
import getBeatAtClientX from "../utils/get_beat_at_client_x/getBeatAtClientX";
import ItemVM from "../view_models/item/ItemVM";
import ItemVMState from "../view_models/item/ItemVMState";
import TimelineVM from "../view_models/timeline/TimelineVM";
import TimelineVMState from "../view_models/timeline/TimelineVMState";
import TrackVM from "../view_models/track/TrackVM";
import TrackVMState from "../view_models/track/TrackVMState";

import type TimelineContext from "../contexts/TimelineContext";
import type Item from "../models/item/Item";
import type Timeline from "../models/timeline/Timeline";

class VMFactory {
    constructor(private _context: TimelineContext) {}

    createItemVM(model: Item): ItemVM {
        const update = (model: Item): ItemVMState => {
            const handleMouseDown = (event: MouseEvent) => {
                if (event.shiftKey) {
                    this._context.selection.toggleSelected(model);
                } else {
                    this._context.selection.deselectAll();
                    this._context.selection.selectItem(model);
                }
                event.stopPropagation();
            };

            return new ItemVMState(
                model.interval.start,
                model.interval.end,
                model.content,
                chroma.hcl(0, 0, 80),
                this._context.selection.isSelected(model)
                    ? chroma.hcl(240, 80, 80)
                    : chroma.hcl(0, 0, 0, 0),
                handleMouseDown
            );
        };

        return new ItemVM(model, update);
    }

    createTrackVM(model: Track): TrackVM {
        const update = (model: Track): TrackVMState => {
            return new TrackVMState(
                model.label,
                model.items.map((item) => {
                    return this.createItemVM(item);
                })
            );
        };

        return new TrackVM(model, update);
    }

    createTimelineVM(model: Timeline): TimelineVM {
        const update = (model: Timeline): TimelineVMState => {
            let center = model.voices.map((voice) => {
                return [
                    this.createTrackVM(voice.outputTrack),
                    this.createTrackVM(voice.pitchTrack),
                    this.createTrackVM(voice.durationTrack),
                    this.createTrackVM(voice.restTrack),
                    this.createTrackVM(voice.harmonyTrack),
                ];
            });

            let bottom = [[this.createTrackVM(model.harmonicSumTrack)]];

            const handleMouseDown = (event: MouseEvent) => {
                if (event.shiftKey) return;
                this._context.selection.deselectAll();
            };

            const handleMouseMove = (event: MouseEvent) => {
                const hoveredBeat = getBeatAtClientX(model, event.clientX);
                const hoveredTrack = findClosestTrack(model, event.clientY);

                this._context.cursor.hoveredBeat = hoveredBeat;
                this._context.cursor.hoveredTrack = hoveredTrack;
            };

            return new TimelineVMState(
                [],
                center,
                bottom,
                handleMouseDown,
                handleMouseMove
            );
        };

        return new TimelineVM(model, update);
    }
}

export default VMFactory;
