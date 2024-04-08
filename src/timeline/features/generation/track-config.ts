import {
    getChildren,
    getIndex,
    getParent,
} from "../../../architecture/state-hierarchy-utils";
import type Track from "../../models/track/Track";
import type Voice from "../../models/voice/Voice";

export function getTrackType(track: Track<any>) {
    const trackIndex = getIndex(track);
    const groupIndex = getIndex(getParent(track));

    switch (`${groupIndex},${trackIndex}`) {
        case "0,0":
            return "output";
        case "1,0":
            return "pitch";
        case "1,1":
            return "duration";
        case "1,2":
            return "rest";
        case "1,3":
            return "harmony";
    }
}

export function getOutputTrack(voice: Voice): Track<any> {
    return getChildren(getChildren(voice)[0])[0];
}

export function getPitchTrack(voice: Voice): Track<any> {
    return getChildren(getChildren(voice)[1])[0];
}

export function getDurationTrack(voice: Voice): Track<any> {
    return getChildren(getChildren(voice)[1])[1];
}

export function getRestTrack(voice: Voice): Track<any> {
    return getChildren(getChildren(voice)[1])[2];
}

export function getHarmonyTrack(voice: Voice): Track<any> {
    return getChildren(getChildren(voice)[1])[3];
}
