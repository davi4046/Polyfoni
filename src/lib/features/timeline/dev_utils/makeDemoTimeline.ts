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

import type ItemTypes from "../models/_shared/item_types/ItemTypes";

function makeRandomItems<T extends keyof ItemTypes>(
    itemType: T,
    track: Track<T>
): Item<T>[] {
    const items: Item<T>[] = [];

    let beat = 0;

    while (beat < 8) {
        const length = Math.round(mapRange(Math.random(), 0, 1, 1, 4));
        const end = beat + length;
        if (Math.random() > 0.2) {
            items.push(
                new Item(
                    itemType,
                    createItemState({
                        parent: track,
                        start: beat,
                        end: end,
                    })
                )
            );
        }
        beat = end;
    }

    return items;
}

function populateTrack(track: Track<any>) {
    const items = makeRandomItems(track.itemType, track);
    track.state = { children: items };
}

function createDefaultTracks(voice: Voice): Track<any>[] {
    const tracks: Track<any>[] = [];

    tracks.push(
        new Track(
            "StringItem",
            createTrackState({
                parent: voice,
                label: "Piano 1",
                children: [],
            })
        ),
        new Track(
            "StringItem",
            createTrackState({
                parent: voice,
                label: "Pitch",
                children: [],
            })
        ),
        new Track(
            "StringItem",
            createTrackState({
                parent: voice,
                label: "Duration",
                children: [],
            })
        ),
        new Track(
            "StringItem",
            createTrackState({
                parent: voice,
                label: "Rest",
                children: [],
            })
        ),
        new Track(
            "ChordItem",
            createTrackState({
                parent: voice,
                label: "Harmony",
                children: [],
            })
        )
    );

    tracks.forEach(populateTrack);

    return tracks;
}

function makeDemoTimeline(): Timeline {
    const timeline = new Timeline(createTimelineState({ children: [] }));

    const sections = Array.from({ length: 3 }, () => {
        return new Section(
            createSectionState({ parent: timeline, children: [] })
        );
    });

    timeline.state = { children: sections };

    const voices = Array.from({ length: 3 }, () => {
        const voice = new Voice(
            createVoiceState({ parent: sections[1], children: [] })
        );

        voice.state = { children: createDefaultTracks(voice) };

        return voice;
    });

    sections[1].state = { children: voices };

    return timeline;
}

export default makeDemoTimeline;
