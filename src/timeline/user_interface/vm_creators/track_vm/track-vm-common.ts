import { getGrandparent } from "../../../../architecture/state-hierarchy-utils";
import type Track from "../../../models/track/Track";

export const positionLabelMap = new Map<string, (track: Track<any>) => string>([
    ["0,*,*,0", (_) => "Tempo"],
    ["0,*,*,1", (_) => "Scale"],
    ["1,*,0,0", (track) => getGrandparent(track).state.label],
    ["1,*,1,0", (_) => "Pitch"],
    ["1,*,1,1", (_) => "Duration"],
    ["1,*,1,2", (_) => "Rest?"],
    ["1,*,1,3", (_) => "Harmony"],
    ["1,*,2,0", (_) => "Pitches"],
    ["1,*,2,1", (_) => "Fraction"],
    ["1,*,2,2", (_) => "Skip?"],
    ["1,*,2,3", (_) => "Harmony"],
    ["2,*,*,0", (_) => "Harmonic Sum"],
]);
