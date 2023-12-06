import Item from "../models/item/Item";
import Timeline from "../models/timeline/Timeline";
import Voice from "../models/voice/Voice";

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

    const timeline = new Timeline([]);

    const voices = [
        new Voice(timeline, "Piano 1"),
        new Voice(timeline, "Piano 2"),
        new Voice(timeline, "Piano 3"),
    ];

    for (const voice of voices) {
        for (const track of voice.tracks.slice(1, 5)) {
            let start = 0;

            while (start < 8) {
                const length = Math.round(mapRange(Math.random(), 0, 1, 1, 4));
                const end = start + length;

                if (Math.random() > 0.2) {
                    track.items.push(
                        new Item(track, start, end, "blahblahblah")
                    );
                }

                start = end;
            }
        }
        timeline.voices.push(voice);
    }

    return timeline;
}

export default makeDemoTimeline;
