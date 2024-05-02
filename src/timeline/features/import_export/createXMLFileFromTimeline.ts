import { toXML } from "to-xml";

import { getTrackType } from "../generation/track-config";
import { getChildren } from "../../../architecture/state-hierarchy-utils";
import { Chord, getDecimalFromPitches } from "../../models/item/Chord";
import type Item from "../../models/item/Item";
import type { ItemTypes } from "../../models/item/ItemTypes";
import type Timeline from "../../models/timeline/Timeline";

export default function createXMLFileFromTimeline(timeline: Timeline): string {
    const data: any = {};

    function convertItem(item: Item<any>) {
        return {
            ...{
                "@start": item.state.start,
                "@end": item.state.end,
            },
            ...convertItemContent(item.itemType, item.state.content),
        };
    }

    function convertItemContent<T extends keyof ItemTypes>(
        itemType: T,
        content: ItemTypes[T]
    ) {
        const converter = itemContentConverters[itemType];
        if (converter) return converter(content);
    }

    data.tempoTrack = {
        item: getChildren(timeline.tempoTrack).map(convertItem),
    };
    data.scaleTrack = {
        item: getChildren(timeline.scaleTrack).map(convertItem),
    };
    data.aliases = timeline.state.aliases;

    data.voice = getChildren(getChildren(timeline)[1]).map((voice) => {
        const tracks = getChildren(voice)
            .slice(1)
            .flatMap((trackGroup) => getChildren(trackGroup));

        const tracksData = Object.fromEntries(
            tracks.map((track) => {
                const trackType = getTrackType(track);

                if (trackType === undefined) {
                    throw new Error("TrackType not defined");
                }

                const trackData = {
                    item: getChildren(track).map(convertItem),
                };

                return [trackType, trackData];
            })
        );

        return {
            "@label": voice.state.label,
            "@instrument": voice.state.instrument,
            ...tracksData,
        };
    });

    return toXML({ timeline: data }, undefined, 2);
}

const itemContentConverters: Partial<{
    [K in keyof ItemTypes]: (content: ItemTypes[K]) => object | undefined;
}> = {
    StringItem: (content) => {
        if (content !== "") return { "#": content };
    },
    ChordItem: (content) => {
        if (content.chordStatus instanceof Chord) {
            return {
                chord: {
                    "@root": content.chordStatus.root,
                    "@decimal": content.chordStatus.decimal,
                },
            };
        } else {
            const decimal = getDecimalFromPitches(content.chordStatus);

            if (decimal === 0) return;

            return {
                chord: {
                    "@decimal": decimal,
                },
            };
        }
    },
};
