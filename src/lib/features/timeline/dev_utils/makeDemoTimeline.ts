import Interval from "../models/interval/Interval";
import ItemModel from "../models/item/Item";
import Timeline from "../models/timeline/Timeline";
import VoiceModel from "../models/voice/Voice";

function makeDemoTimeline(): Timeline {
    const mapRange = (
        value: number,
        inMin: number,
        inMax: number,
        outMin: number,
        outMax: number
    ) => {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    };

    let voices = [
        new VoiceModel("Piano 1"),
        new VoiceModel("Piano 2"),
        new VoiceModel("Piano 3"),
    ];

    for (let voice of voices) {
        for (let track of [
            voice.pitchTrack,
            voice.durationTrack,
            voice.restTrack,
            voice.harmonyTrack,
        ]) {
            let start = 0;

            while (start < 8) {
                let length = Math.round(mapRange(Math.random(), 0, 1, 1, 4));
                let end = start + length;

                if (Math.random() > 0.2) {
                    track.items.push(
                        new ItemModel(new Interval(start, end), "blahblahblah")
                    );
                }

                start = end;
            }
        }
    }

    let timeline = new Timeline(voices);

    return timeline;
}

export default makeDemoTimeline;
