import Item from "../models/item/Item";
import Timeline from "../models/timeline/Timeline";
import Track from "../models/track/Track";
import Voice from "../models/voice/Voice";
import {
    itemInitialContentFunctions,
    type ItemTypes,
} from "../utils/ItemTypes";
import {
    addChildren,
    getChildren,
} from "../../architecture/state-hierarchy-utils";

export default function makeDemoTimeline(): Timeline {
    const timeline = new Timeline();

    const voices = Array.from({ length: 3 }, () => {
        const voice = new Voice({
            parent: getChildren(timeline)[1],
            children: [],
        });

        addChildren(voice, ...createDefaultTracks(voice));

        return voice;
    });

    addChildren(getChildren(timeline)[1], ...voices);

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
                    content: itemInitialContentFunctions[itemType](),
                })
            );
        }
        beat = end;
    }

    return items;
}

function createDefaultTracks(voice: Voice): Track<any>[] {
    const tracks: Track<any>[] = [];

    tracks.push(
        new Track("NoteItem", {
            parent: voice,
            label: "Piano 1",
            children: [],
            allowUserEdit: false,
        }),
        new Track("StringItem", {
            parent: voice,
            label: "Pitch",
            children: [],
            allowUserEdit: true,
        }),
        new Track("StringItem", {
            parent: voice,
            label: "Duration",
            children: [],
            allowUserEdit: true,
        }),
        new Track("StringItem", {
            parent: voice,
            label: "Rest",
            children: [],
            allowUserEdit: true,
        }),
        new Track("ChordItem", {
            parent: voice,
            label: "Harmony",
            children: [],
            allowUserEdit: true,
        })
    );

    tracks.forEach((track) => {
        const items = makeRandomItems(track.itemType, track);
        addChildren(track, ...items);
    });

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
