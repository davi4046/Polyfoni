import { fromXML } from "from-xml";

import { z } from "zod";

import {
    addChildren,
    getChildren,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import {
    Chord,
    createEmptyPitchMap,
    getPitchesFromDecimal,
} from "../../models/item/Chord";
import Item from "../../models/item/Item";
import Timeline from "../../models/timeline/Timeline";
import Track from "../../models/track/Track";
import TrackGroup from "../../models/track_group/TrackGroup";
import Voice from "../../models/voice/Voice";
import VoiceGroup from "../../models/voice_group/VoiceGroup";

const ChordSchema = z.object({
    "@root": z
        .enum(["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"])
        .optional(),
    "@decimal": z.string().transform((val, ctx) => {
        const parsed = Number(val);

        if (!Number.isInteger(parsed)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be an integer",
            });

            return z.NEVER;
        }

        if (parsed < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be greater than zero",
            });

            return z.NEVER;
        }

        if (parsed > 4095) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be less than 4096",
            });

            return z.NEVER;
        }

        if (parsed % 2 !== 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be uneven",
            });

            return z.NEVER;
        }

        return parsed;
    }),
});

function stringToNumber(val: string, ctx: z.RefinementCtx) {
    const parsed = Number(val);

    if (isNaN(parsed)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Not a number",
        });

        return z.NEVER;
    }

    return parsed;
}

const ChordItemSchema = z.object({
    "@start": z.string().transform(stringToNumber),
    "@end": z.string().transform(stringToNumber),
    chord: ChordSchema.optional(),
});

const StringItemSchema = z.object({
    "@start": z.string().transform(stringToNumber),
    "@end": z.string().transform(stringToNumber),
    "#": z.string().optional(),
});

const StringTrackSchema = z.object({
    item: StringItemSchema.transform((item) => [item])
        .or(z.array(StringItemSchema))
        .optional(),
});

const ChordTrackSchema = z.object({
    item: ChordItemSchema.transform((item) => [item])
        .or(z.array(ChordItemSchema))
        .optional(),
});

const VoiceSchema = z.object({
    "@label": z.string(),
    "@instrument": z.string().transform((val, ctx) => {
        const parsed = Number(val);

        if (!Number.isInteger(parsed)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be an integer",
            });

            return z.NEVER;
        }

        if (parsed < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be greater than zero",
            });

            return z.NEVER;
        }

        if (parsed > 127) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be less than 128",
            });

            return z.NEVER;
        }

        return parsed;
    }),

    track: z.tuple([
        StringTrackSchema,
        StringTrackSchema,
        StringTrackSchema,
        ChordTrackSchema,
        StringTrackSchema,
        StringTrackSchema,
        StringTrackSchema,
        ChordTrackSchema,
    ]),
});

const TimelineSchema = z.object({
    aliases: z
        .record(z.string(), z.string())
        .or(z.string().transform(() => undefined)),

    scaleTrack: ChordTrackSchema,
    tempoTrack: StringTrackSchema,

    voice: VoiceSchema.transform((voice) => [voice])
        .or(z.array(VoiceSchema))
        .or(z.string().transform(() => undefined)),
});

type StringTrackType = z.infer<typeof StringTrackSchema>;
type ChordTrackType = z.infer<typeof ChordTrackSchema>;

export default function createTimelineFromXMLFile(xml: string): Timeline {
    const timelineData = TimelineSchema.parse(fromXML(xml));

    const timeline = new Timeline();

    if (timelineData.voice) {
        const voices = timelineData.voice.map((voiceData) => {
            const voice = new Voice({
                parent: getChildren(timeline)[1],
                label: voiceData["@label"],
                instrument: voiceData["@instrument"],
                children: [],
            });

            const outputGroup = new TrackGroup({ parent: voice, children: [] });
            const outputTrack = new Track("NoteItem", {
                parent: outputGroup,
                children: [],
            });

            addChildren(getParent(outputGroup), outputGroup);
            addChildren(getParent(outputTrack), outputTrack);

            const frameworkGroup = new TrackGroup({
                parent: voice,
                children: [],
            });
            const decorationGroup = new TrackGroup({
                parent: voice,
                children: [],
            });

            const frameworkTracks = voiceData.track
                .slice(0, 5)
                .map((trackData) =>
                    createTrackFromData(frameworkGroup, trackData)
                );

            const decorationTracks = voiceData.track
                .slice(0, 5)
                .map((trackData) =>
                    createTrackFromData(decorationGroup, trackData)
                );

            addChildren(getParent(frameworkGroup), frameworkGroup);
            addChildren(frameworkGroup, ...frameworkTracks);

            addChildren(getParent(decorationGroup), decorationGroup);
            addChildren(decorationGroup, ...decorationTracks);

            function createTrackFromData(
                parent: TrackGroup,
                trackData: ChordTrackType | StringTrackType
            ) {
                const validateStringTrack =
                    StringTrackSchema.safeParse(trackData);

                const itemType = validateStringTrack.success
                    ? "StringItem"
                    : "ChordItem";

                const track = new Track(itemType, {
                    parent: parent,
                    children: [],
                });

                const items = (() => {
                    if (trackData.item === undefined) return [];

                    if (validateStringTrack.success) {
                        return (trackData as StringTrackType).item!.map(
                            (itemData) => {
                                return new Item("StringItem", {
                                    parent: track,
                                    start: itemData["@start"],
                                    end: itemData["@end"],
                                    content: itemData["#"] ? itemData["#"] : "",
                                });
                            }
                        );
                    } else {
                        return (trackData as ChordTrackType).item!.map(
                            (itemData) => {
                                const chordStatus =
                                    itemData.chord !== undefined
                                        ? itemData.chord["@root"] !== undefined
                                            ? Chord.fromDecimal(
                                                  itemData.chord["@root"],
                                                  itemData.chord["@decimal"]
                                              )
                                            : getPitchesFromDecimal(
                                                  itemData.chord["@decimal"]
                                              )
                                        : createEmptyPitchMap();

                                return new Item("ChordItem", {
                                    parent: track,
                                    start: itemData["@start"],
                                    end: itemData["@end"],
                                    content: {
                                        chordStatus: chordStatus,
                                        filters: [],
                                    },
                                });
                            }
                        );
                    }
                })();

                addChildren(track, ...items);

                return track;
            }

            return voice;
        });

        addChildren(getChildren(timeline)[1], ...voices);
    }

    return timeline;
}
