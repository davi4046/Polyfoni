import { toXML } from "to-xml";

import { getTrackType } from "../generation/track-config";
import { getChildren } from "../../../architecture/state-hierarchy-utils";
import { Chord, getDecimalFromPitches } from "../../models/item/Chord";
import type Item from "../../models/item/Item";
import type { ItemTypes } from "../../models/item/ItemTypes";
import type Timeline from "../../models/timeline/Timeline";

export default function createXMLFileFromTimeline(timeline: Timeline): string {
    const root: any = {};

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

    root.tempoTrack = {
        item: getChildren(timeline.tempoTrack).map(convertItem),
    };
    root.scaleTrack = {
        item: getChildren(timeline.scaleTrack).map(convertItem),
    };
    root.aliases = timeline.state.aliases;

    root.voice = getChildren(getChildren(timeline)[1]).map((voice) => {
        const tracks = getChildren(voice)
            .slice(1)
            .flatMap((trackGroup) => getChildren(trackGroup));

        return {
            "@label": voice.state.label,
            "@instrument": voice.state.instrument,
            track: tracks.flatMap((track) => {
                const trackType = getTrackType(track);

                return [
                    {
                        "!": `-- ${trackType} --`,
                        item: getChildren(track).map(convertItem),
                    },
                ];
            }),
        };
    });

    return toXML(root, undefined, 2);
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
