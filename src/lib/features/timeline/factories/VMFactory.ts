import type Item from "../models/item/Item";
import type TimelineModel from "../models/timeline/Timeline";
import type Track from "../models/track/Track";
import ItemVM from "../view_models/item/ItemVM";
import TimelineVM from "../view_models/timeline/TimelineVM";
import TrackVM from "../view_models/track/TrackVM";

abstract class VMFactory {
    private static createItemVM(model: Item): ItemVM {
        let itemVM = new ItemVM(
            model.interval.start,
            model.interval.end,
            model.content,
            (_) => {
                console.log("item mousedown");
            }
        );
        // TODO: assign callback functions on itemVM
        return itemVM;
    }

    static createTrackVM(model: Track): TrackVM {
        let trackVM = new TrackVM(
            model.label,
            model.items.map((item) => {
                return this.createItemVM(item);
            })
        );
        // TODO: assign callback functions on trackVM
        return trackVM;
    }

    static createTimelineVM(model: TimelineModel): TimelineVM {
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

        let timelineVM = new TimelineVM([], center, bottom);
        // TODO: assign callback functions on timelineVM
        return timelineVM;
    }
}

export default VMFactory;
