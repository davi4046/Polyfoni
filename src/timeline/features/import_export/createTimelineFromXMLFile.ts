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
import type VoiceGroup from "../../models/voice_group/VoiceGroup";

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

function mustBeInteger(val: number, ctx: z.RefinementCtx) {
    if (!Number.isInteger(val)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be an integer",
        });

        return z.NEVER;
    }
    return val;
}

function mustBeInRange(val: number, ctx: z.RefinementCtx) {
    if (val < 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be greater than zero",
        });

        return z.NEVER;
    }
    if (val > 4095) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be less than 4096",
        });

        return z.NEVER;
    }
    return val;
}

function mustBeUneven(val: number, ctx: z.RefinementCtx) {
    if (val % 2 !== 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be uneven",
        });

        return z.NEVER;
    }
    return val;
}

const ChordSchema = z.object({
    "@root": z
        .enum(["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"])
        .optional(),
    "@decimal": z
        .string()
        .transform(stringToNumber)
        .transform(mustBeInteger)
        .transform(mustBeInRange),
});

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
    decorationHarmony: ChordTrackSchema,
});

const TimelineSchema = z.object({
    timeline: z.object({
        "@length": z
            .string()
            .transform(stringToNumber)
            .transform(mustBeInteger),
        aliases: z
            .record(z.string(), z.string())
            .or(z.string().transform(() => undefined)),

        scaleTrack: ChordTrackSchema,
        tempoTrack: StringTrackSchema,

        voice: VoiceSchema.transform((voice) => [voice])
            .or(z.array(VoiceSchema))
            .or(z.string().transform(() => undefined)),
    }),
});

type StringItemData = z.infer<typeof StringItemSchema>;
type ChordItemData = z.infer<typeof ChordItemSchema>;

type StringTrackData = z.infer<typeof StringTrackSchema>;
type ChordTrackData = z.infer<typeof ChordTrackSchema>;

type VoiceData = z.infer<typeof VoiceSchema>;

export default function createTimelineFromXMLFile(xml: string): Timeline {
    const timelineData = TimelineSchema.parse(fromXML(xml)).timeline;

    const timeline = new Timeline();

    if (timelineData.aliases) {
        timeline.state = { aliases: timelineData.aliases };
    }

    if (timelineData["@length"]) {
        timeline.state = { length: timelineData["@length"] };
    }

    if (timelineData.tempoTrack && timelineData.tempoTrack.item) {
        const tempoItems = timelineData.tempoTrack.item.map((itemData) =>
            createStringItem(timeline.tempoTrack, itemData)
        );
        addChildren(timeline.tempoTrack, ...tempoItems);
    }

    if (timelineData.scaleTrack && timelineData.scaleTrack.item) {
        const scaleItems = timelineData.scaleTrack.item.map((itemData) =>
            createChordItem(timeline.scaleTrack, itemData)
        );
        addChildren(timeline.scaleTrack, ...scaleItems);
    }

    if (timelineData.voice) {
        const midVoiceGroup = getChildren(timeline)[1];

        const voices = timelineData.voice.map((voiceData) =>
            createVoice(midVoiceGroup, voiceData)
        );

        addChildren(midVoiceGroup, ...voices);
    }

    return timeline;
}

export function createVoice(parent: VoiceGroup, data: VoiceData): Voice {
    const voice = new Voice({
        parent: parent,
        label: data["@label"],
        instrument: data["@instrument"],
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
        createStringTrack(frameworkGroup, data.frameworkPitch),
        createStringTrack(frameworkGroup, data.frameworkDuration),
        createStringTrack(frameworkGroup, data.frameworkRest),
        createChordTrack(frameworkGroup, data.frameworkHarmony),
    ];

    const decorationTracks = [
        createStringTrack(decorationGroup, data.decorationPitches),
        createStringTrack(decorationGroup, data.decorationFraction),
        createStringTrack(decorationGroup, data.decorationSkip),
        createChordTrack(decorationGroup, data.decorationHarmony),
    ];

    addChildren(getParent(frameworkGroup), frameworkGroup);
    addChildren(frameworkGroup, ...frameworkTracks);

    addChildren(getParent(decorationGroup), decorationGroup);
    addChildren(decorationGroup, ...decorationTracks);

    return voice;
}

function createStringItem(
    parent: Track<"StringItem">,
    data: StringItemData
): Item<"StringItem"> {
    return new Item("StringItem", {
        parent: parent,
        start: data["@start"],
        end: data["@end"],
        content: data["#"] ? data["#"] : "",
    });
}

function createChordItem(
    parent: Track<"ChordItem">,
    data: ChordItemData
): Item<"ChordItem"> {
    const chordStatus = (() => {
        if (data.chord === undefined) return createEmptyPitchMap();

        if (data.chord["@root"]) {
            return Chord.fromDecimal(
                data.chord["@root"],
                data.chord["@decimal"]
            );
        } else {
            return getPitchesFromDecimal(data.chord["@decimal"]);
        }
    })();

    return new Item("ChordItem", {
        parent: parent,
        start: data["@start"],
        end: data["@end"],
        content: {
            chordStatus: chordStatus,
            filters: [],
        },
    });
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
        ? data.item.map((itemData) => createStringItem(track, itemData))
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

    const items = data.item
        ? data.item.map((itemData) => createChordItem(track, itemData))
        : [];

    addChildren(track, ...items);

    return track;
}
