import { toXML } from "to-xml";

import { getTrackType } from "../generation/track-config";
import { getChildren } from "../../../architecture/state-hierarchy-utils";
import { Chord, type PitchMap } from "../../models/item/Chord";
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

    root.voice = getChildren(getChildren(timeline)[1]).map((voice) => {
        const tracks = getChildren(voice)
            .slice(1)
            .flatMap((trackGroup) => getChildren(trackGroup));

        const tracksObj = Object.fromEntries(
            tracks.map((track) => {
                const trackType = getTrackType(track);
                const fieldName = trackType ? trackType : "track";
                return [
                    fieldName,
                    {
                        item: getChildren(track).map(convertItem),
                    },
                ];
            })
        );

        return {
            "@label": voice.state.label,
            "@instrument": voice.state.instrument,
            ...tracksObj,
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
            const decimal = pitchMapToDecimal(content.chordStatus);

            if (decimal === 0) return;

            return {
                scale: {
                    "@decimal": decimal,
                },
            };
        }
    },
};

function pitchMapToDecimal(pitchMap: PitchMap): number {
    const binary = Object.values(pitchMap)
        .reverse()
        .reduce(
            (binaryString, value) => binaryString + (value ? "1" : "0"),
            ""
        );
    return Number.parseInt(binary, 2);
}
