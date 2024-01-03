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

function makeRandomItems(track: Track<"StringItem">): Item<"StringItem">[] {
    const items: Item<"StringItem">[] = [];

    let beat = 0;

    while (beat < 8) {
        const length = Math.round(mapRange(Math.random(), 0, 1, 1, 4));
        const end = beat + length;
        if (Math.random() > 0.2) {
            const newItem = new Item("StringItem", (item) =>
                createItemState({
                    parent: track,
                    start: beat,
                    end: end,
                })
            );
            items.push(newItem);
        }
        beat = end;
    }

    return items;
}

function makeDemoTimeline(): Timeline {
    return new Timeline((timeline) =>
        createTimelineState({
            children: [
                new Section((section) =>
                    createSectionState({
                        parent: timeline,
                        children: [],
                    })
                ),
                new Section((section) =>
                    createSectionState({
                        parent: timeline,
                        children: [
                            new Voice((voice) =>
                                createVoiceState({
                                    parent: section,
                                    children: [
                                        new Track("StringItem", (track) =>
                                            createTrackState({
                                                parent: voice,
                                                label: "Piano 1",
                                                children:
                                                    makeRandomItems(track),
                                            })
                                        ),
                                        new Track("StringItem", (track) =>
                                            createTrackState({
                                                parent: voice,
                                                label: "Pitch",
                                                children:
                                                    makeRandomItems(track),
                                            })
                                        ),
                                        new Track("StringItem", (track) =>
                                            createTrackState({
                                                parent: voice,
                                                label: "Duration",
                                                children:
                                                    makeRandomItems(track),
                                            })
                                        ),
                                        new Track("StringItem", (track) =>
                                            createTrackState({
                                                parent: voice,
                                                label: "Rest",
                                                children:
                                                    makeRandomItems(track),
                                            })
                                        ),
                                        new Track("StringItem", (track) =>
                                            createTrackState({
                                                parent: voice,
                                                label: "Harmony",
                                                children:
                                                    makeRandomItems(track),
                                            })
                                        ),
                                    ],
                                })
                            ),
                        ],
                    })
                ),
                new Section((section) =>
                    createSectionState({
                        parent: timeline,
                        children: [
                            new Voice((voice) =>
                                createVoiceState({
                                    parent: section,
                                    children: [
                                        new Track("StringItem", (track) =>
                                            createTrackState({
                                                parent: voice,
                                                label: "Harmonic Sum",
                                                children: [],
                                            })
                                        ),
                                    ],
                                })
                            ),
                        ],
                    })
                ),
            ],
        })
    );
}

export default makeDemoTimeline;
