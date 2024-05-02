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

const StringTrackSchema = z
    .object({
        item: StringItemSchema.transform((item) => [item])
            .or(z.array(StringItemSchema))
            .optional(),
    })
    .or(z.string().transform(() => undefined));

const ChordTrackSchema = z
    .object({
        item: ChordItemSchema.transform((item) => [item])
            .or(z.array(ChordItemSchema))
            .optional(),
    })
    .or(z.string().transform(() => undefined));

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

    frameworkPitch: StringTrackSchema,
    frameworkDuration: StringTrackSchema,
    frameworkRest: StringTrackSchema,
    frameworkHarmony: ChordTrackSchema,

    decorationPitches: StringTrackSchema,
    decorationFraction: StringTrackSchema,
    decorationSkip: StringTrackSchema,
    decorationHarmony: StringTrackSchema,
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

type StringTrackData = z.infer<typeof StringTrackSchema>;
type ChordTrackData = z.infer<typeof ChordTrackSchema>;

export default function createTimelineFromXMLFile(xml: string): Timeline {
    const timelineData = TimelineSchema.parse(fromXML(xml));

    const timeline = new Timeline();

    if (timelineData.aliases) {
        timeline.state = {
            aliases: timelineData.aliases,
        };
    }

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

            const frameworkTracks = [
                createStringTrack(frameworkGroup, voiceData.frameworkPitch),
                createStringTrack(frameworkGroup, voiceData.frameworkDuration),
                createStringTrack(frameworkGroup, voiceData.frameworkRest),
                createChordTrack(frameworkGroup, voiceData.frameworkHarmony),
            ];

            const decorationTracks = [
                createStringTrack(decorationGroup, voiceData.decorationPitches),
                createStringTrack(
                    decorationGroup,
                    voiceData.decorationFraction
                ),
                createStringTrack(decorationGroup, voiceData.decorationSkip),
                createChordTrack(decorationGroup, voiceData.decorationHarmony),
            ];

            addChildren(getParent(frameworkGroup), frameworkGroup);
            addChildren(frameworkGroup, ...frameworkTracks);

            addChildren(getParent(decorationGroup), decorationGroup);
            addChildren(decorationGroup, ...decorationTracks);

            return voice;
        });

        addChildren(getChildren(timeline)[1], ...voices);
    }

    return timeline;
}

function createStringTrack(
    parent: TrackGroup,
    data: StringTrackData
): Track<"StringItem"> {
    const track = new Track("StringItem", {
        parent: parent,
        children: [],
    });

    if (data === undefined) return track;

    const items = data.item
        ? data.item.map((itemData) => {
              return new Item("StringItem", {
                  parent: track,
                  start: itemData["@start"],
                  end: itemData["@end"],
                  content: itemData["#"] ? itemData["#"] : "",
              });
          })
        : [];

    addChildren(track, ...items);

    return track;
}

function createChordTrack(
    parent: TrackGroup,
    data: ChordTrackData
): Track<"ChordItem"> {
    const track = new Track("ChordItem", {
        parent: parent,
        children: [],
    });

    if (data === undefined) return track;

    const items = (() => {
        if (data.item === undefined) return [];

        return data.item.map((itemData) => {
            const chordStatus = (() => {
                if (itemData.chord === undefined) {
                    return createEmptyPitchMap();
                }

                if (itemData.chord["@root"] === undefined) {
                    return getPitchesFromDecimal(itemData.chord["@decimal"]);
                }

                return Chord.fromDecimal(
                    itemData.chord["@root"],
                    itemData.chord["@decimal"]
                );
            })();

            return new Item("ChordItem", {
                parent: track,
                start: itemData["@start"],
                end: itemData["@end"],
                content: {
                    chordStatus: chordStatus,
                    filters: [],
                },
            });
        });
    })();

    addChildren(track, ...items);

    return track;
}
