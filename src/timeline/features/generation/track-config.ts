import {
    doesValueMatchSymbol,
    getChildren,
    getIndex,
    getPosition,
    isPositionOnPath,
} from "../../../architecture/state-hierarchy-utils";
import type Track from "../../models/track/Track";
import type Voice from "../../models/voice/Voice";

type TrackType =
    | "output"
    | "frameworkPitch"
    | "frameworkDuration"
    | "frameworkRest"
    | "frameworkHarmony"
    | "decorationPitches"
    | "decorationFraction"
    | "decorationSkip"
    | "decorationHarmony";

export const pathToTrackTypeMap = new Map<string, TrackType>([
    ["1,*,0,0", "output"],

    ["1,*,1,0", "frameworkPitch"],
    ["1,*,1,1", "frameworkDuration"],
    ["1,*,1,2", "frameworkRest"],
    ["1,*,1,3", "frameworkHarmony"],

    ["1,*,2-*,0", "decorationPitches"],
    ["1,*,2-*,1", "decorationFraction"],
    ["1,*,2-*,2", "decorationSkip"],
    ["1,*,2-*,3", "decorationHarmony"],
]);

export const trackTypeToPathMap = new Map<TrackType, string>(
    Array.from(pathToTrackTypeMap.entries()).map(([position, trackType]) => [
        trackType,
        position,
    ])
);

export function getTracksOfType(
    voice: Voice,
    trackType: TrackType
): Track<any>[] {
    const trackTypePath = trackTypeToPathMap.get(trackType);

    if (!trackTypePath) {
        throw new Error(
            `Tried to get tracks of tracktype with non-specified path: ${trackType}`
        );
    }

    if (!isPositionOnPath(getPosition(voice), trackTypePath)) {
        throw new Error(
            `Given tracktype does not exist on given voice: ${trackType}`
        );
    }

    function filterChildrenRecursive(obj: Object, symbols: string[]): any[] {
        const symbol = symbols.shift();

        if (!symbol) return [obj];

        const matchingChildren = getChildren(obj as any).filter((child) =>
            doesValueMatchSymbol(getIndex(child as any), symbol)
        );

        return matchingChildren.flatMap((child) =>
            filterChildrenRecursive(child as any, symbols)
        );
    }

    const symbols = trackTypePath.split(",").slice(2);

    return filterChildrenRecursive(voice, symbols) as Track<any>[];
}

export function getTrackType(track: Track<any>): TrackType | undefined {
    const position = getPosition(track);
    for (const [pattern, value] of pathToTrackTypeMap) {
        if (isPositionOnPath(position, pattern)) return value;
    }
}
