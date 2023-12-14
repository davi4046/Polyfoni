import mapRange from "../../../shared/utils/math_utils/map_range/mapRange";
import Item from "../models/item/Item";
import { createItemState } from "../models/item/ItemState";
import Section from "../models/section/Section";
import { createSectionState } from "../models/section/SectionState";
import Timeline from "../models/timeline/Timeline";
import { createTimelineState } from "../models/timeline/TimelineState";
import Track from "../models/track/Track";
import { createTrackState } from "../models/track/TrackState";
import Voice from "../models/voice/Voice";
import { createVoiceState } from "../models/voice/VoiceState";

function makeRandomItems(track: Track): Item[] {
    const items: Item[] = [];

    let beat = 0;

    while (beat < 8) {
        const length = Math.round(mapRange(Math.random(), 0, 1, 1, 4));
        const end = beat + length;
        if (Math.random() > 0.2) {
            items.push(
                new Item((item) =>
                    createItemState({
                        parent: track,
                        start: beat,
                        end: end,
                        content: "blahblahlblahblah",
                    })
                )
            );
        }
        beat = end;
    }

    return items;
}

function makeDemoTimeline(): Timeline {
    return new Timeline((timeline) =>
        createTimelineState({
            top: new Section((section) =>
                createSectionState({
                    timeline: timeline,
                    voices: [],
                })
            ),
            center: new Section((section) =>
                createSectionState({
                    timeline: timeline,
                    voices: [
                        new Voice((voice) =>
                            createVoiceState({
                                section: section,
                                tracks: [
                                    new Track((track) =>
                                        createTrackState({
                                            voice: voice,
                                            label: "Piano 1",
                                            items: makeRandomItems(track),
                                        })
                                    ),
                                    new Track((track) =>
                                        createTrackState({
                                            voice: voice,
                                            label: "Pitch",
                                            items: makeRandomItems(track),
                                        })
                                    ),
                                    new Track((track) =>
                                        createTrackState({
                                            voice: voice,
                                            label: "Duration",
                                            items: makeRandomItems(track),
                                        })
                                    ),
                                    new Track((track) =>
                                        createTrackState({
                                            voice: voice,
                                            label: "Rest",
                                            items: makeRandomItems(track),
                                        })
                                    ),
                                    new Track((track) =>
                                        createTrackState({
                                            voice: voice,
                                            label: "Harmony",
                                            items: makeRandomItems(track),
                                        })
                                    ),
                                ],
                            })
                        ),
                    ],
                })
            ),
            bottom: new Section((section) =>
                createSectionState({
                    timeline: timeline,
                    voices: [
                        new Voice((voice) =>
                            createVoiceState({
                                section: section,
                                tracks: [
                                    new Track((track) =>
                                        createTrackState({
                                            voice: voice,
                                            label: "Harmonic Sum",
                                            items: [],
                                        })
                                    ),
                                ],
                            })
                        ),
                    ],
                })
            ),
        })
    );
}

export default makeDemoTimeline;
