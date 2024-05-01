import {
    doesValueMatchSymbol,
    getChildren,
    getIndex,
    getPosition,
    isPositionOnPath,
} from "../../../architecture/state-hierarchy-utils";
import type Track from "../../models/track/Track";

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

export const trackTypeToPathMap = new Map<TrackType, string>([
    ["output", "1,*,0,0"],

    ["frameworkPitch", "1,*,1,0"],
    ["frameworkDuration", "1,*,1,1"],
    ["frameworkRest", "1,*,1,2"],
    ["frameworkHarmony", "1,*,1,3"],

    ["decorationPitches", "1,*,2,0"],
    ["decorationFraction", "1,*,2,1"],
    ["decorationSkip", "1,*,2,2"],
    ["decorationHarmony", "1,*,2,3"],
]);

export const pathToTrackTypeMap = new Map<string, TrackType>(
    Array.from(trackTypeToPathMap.entries()).map(([position, trackType]) => [
        trackType,
        position,
    ])
);

export function getTracksOfType(
    obj: object,
    trackType: TrackType
): Track<any>[] {
    const trackTypePath = trackTypeToPathMap.get(trackType);

    if (!trackTypePath) {
        throw new Error(
            `Tried to get tracks of tracktype with non-specified path: ${trackType}`
        );
    }

    const position = getPosition(obj);

    if (!isPositionOnPath(position, trackTypePath)) {
        throw new Error("Given tracktype cannot exist on given object");
    }

    const symbols = trackTypePath.split(",");

    if (position.length > symbols.length) {
        // The given object does not contain tracks of the given
        // type because it is deeper in the hierarchy than these
        throw new Error(
            "Given tracktype cannot exist on given object" +
                "because object is deeper than given tracktype"
        );
    }

    symbols.splice(0, position.length); // The remaining symbols to check children against

    function filterChildrenRecursive(obj: Object, symbols: string[]): any[] {
        const symbol = symbols.shift();

        if (symbol === undefined) return [obj];

        const matchingChildren = getChildren(obj as any).filter((child) =>
            doesValueMatchSymbol(getIndex(child as any), symbol)
        );

        return matchingChildren.flatMap((child) =>
            filterChildrenRecursive(child as any, symbols.slice())
        );
    }

    return filterChildrenRecursive(obj, symbols) as Track<any>[];
}

export function getTrackType(track: Track<any>): TrackType | undefined {
    const position = getPosition(track);
    for (const [pattern, value] of pathToTrackTypeMap) {
        if (isPositionOnPath(position, pattern)) return value;
    }
}
