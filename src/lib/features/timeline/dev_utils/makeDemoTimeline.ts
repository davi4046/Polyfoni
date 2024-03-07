import Item from "../models/Item";
import Section from "../models/Section";
import Timeline from "../models/Timeline";
import Track from "../models/Track";
import Voice from "../models/Voice";
import { initialContent, type ItemTypes } from "../utils/ItemTypes";
import { addChildren } from "../../../architecture/state-hierarchy-utils";

export default function makeDemoTimeline(): Timeline {
    const timeline = new Timeline({ children: [] });

    const sections = Array.from({ length: 3 }, () => {
        return new Section({ parent: timeline, children: [] });
    });

    timeline.state = { children: sections };

    const scaleVoice = new Voice({ parent: sections[0], children: [] });
    const scaleTrack = new Track("ChordItem", {
        label: "Scale",
        parent: scaleVoice,
        children: [],
    });

    addChildren(scaleVoice, scaleTrack);
    addChildren(sections[0], scaleVoice);

    const totalHarmonyVoice = new Voice({ parent: sections[2], children: [] });
    const totalHarmonyTrack = new Track("ChordItem", {
        label: "Total Harmony",
        parent: totalHarmonyVoice,
        children: [],
    });

    addChildren(totalHarmonyVoice, totalHarmonyTrack);
    addChildren(sections[2], totalHarmonyVoice);

    const voices = Array.from({ length: 3 }, () => {
        const voice = new Voice({ parent: sections[1], children: [] });

        addChildren(voice, ...createDefaultTracks(voice));

        return voice;
    });

    addChildren(sections[1], ...voices);

    return timeline;
}

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
                new Item<T>(itemType, {
                    parent: track,
                    start: beat,
                    end: end,
                    content: initialContent[itemType](),
                })
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
        new Track("StringItem", {
            parent: voice,
            label: "Piano 1",
            children: [],
        }),
        new Track("StringItem", {
            parent: voice,
            label: "Pitch",
            children: [],
        }),
        new Track("StringItem", {
            parent: voice,
            label: "Duration",
            children: [],
        }),
        new Track("StringItem", {
            parent: voice,
            label: "Rest",
            children: [],
        }),
        new Track("ChordItem", {
            parent: voice,
            label: "Harmony",
            children: [],
        })
    );

    tracks.forEach(populateTrack);

    return tracks;
}

function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
