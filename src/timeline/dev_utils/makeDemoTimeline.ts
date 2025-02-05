import {
    addChildren,
    getChildren,
} from "../../architecture/state-hierarchy-utils";
import Item from "../models/item/Item";
import {
    itemInitialContentFunctions,
    type ItemTypes,
} from "../models/item/ItemTypes";
import Timeline from "../models/timeline/Timeline";
import Track from "../models/track/Track";
import TrackGroup from "../models/track_group/TrackGroup";
import Voice from "../models/voice/Voice";

export default function makeDemoTimeline(): Timeline {
    const timeline = new Timeline();

    const voices = Array.from({ length: 3 }, (_, index) => {
        const voice = new Voice({
            label: `Voice ${index}`,
            instrument: 0,
            parent: getChildren(timeline)[1],
            children: [],
        });

        addChildren(voice, ...createDefaultTrackGroups(voice));

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

function createDefaultTrackGroups(voice: Voice): TrackGroup[] {
    const outputGroup = new TrackGroup({
        parent: voice,
        children: [],
    });
    const frameworkGroup = new TrackGroup({
        parent: voice,
        children: [],
    });
    const decorationGroup = new TrackGroup({
        parent: voice,
        children: [],
    });

    const tracks: Track<any>[] = [];

    tracks.push(
        new Track("NoteItem", {
            parent: outputGroup,
            children: [],
        }),
        new Track("StringItem", {
            parent: frameworkGroup,
            children: [],
        }),
        new Track("StringItem", {
            parent: frameworkGroup,
            children: [],
        }),
        new Track("StringItem", {
            parent: frameworkGroup,
            children: [],
        }),
        new Track("ChordItem", {
            parent: frameworkGroup,
            children: [],
        }),
        new Track("StringItem", {
            parent: decorationGroup,
            children: [],
        }),
        new Track("StringItem", {
            parent: decorationGroup,
            children: [],
        }),
        new Track("StringItem", {
            parent: decorationGroup,
            children: [],
        }),
        new Track("ChordItem", {
            parent: decorationGroup,
            children: [],
        })
    );

    tracks.forEach((track) => {
        const items = makeRandomItems(track.itemType, track);
        addChildren(track, ...items);
    });

    addChildren(outputGroup, tracks[0]);
    addChildren(frameworkGroup, ...tracks.slice(1, 5));
    addChildren(decorationGroup, ...tracks.slice(5));

    return [outputGroup, frameworkGroup, decorationGroup];
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
