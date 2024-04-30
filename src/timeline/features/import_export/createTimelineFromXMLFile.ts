import { fromXML } from "from-xml";

import { z } from "zod";

import type Timeline from "../../models/timeline/Timeline";

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

function stringToDecimal(val: string, ctx: z.RefinementCtx) {
    const parsed = Number(val);

    if (!Number.isInteger(parsed)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Not an integer",
        });

        return z.NEVER;
    }
    if (parsed < 0) return parsed;
}

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
        item: z.union([StringItemSchema, z.array(StringItemSchema)]),
    })
    .or(z.string());

const ChordTrackSchema = z
    .object({
        item: z.union([ChordItemSchema, z.array(ChordItemSchema)]),
    })
    .or(z.string());

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

const ProjectSchema = z.object({
    aliases: z.record(z.string(), z.string()).or(z.string()),
    scaleTrack: ChordTrackSchema,
    tempoTrack: StringTrackSchema,
    voice: VoiceSchema.or(z.array(VoiceSchema)).or(z.string()),
});

export default function createTimelineFromXMLFile(xml: string): Timeline {
    const obj = fromXML(xml);
    const parsed = ProjectSchema.parse(obj);

    console.log(parsed);
}
