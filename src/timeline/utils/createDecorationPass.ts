import { addChildren } from "../../architecture/state-hierarchy-utils";
import Track from "../models/track/Track";
import TrackGroup from "../models/track_group/TrackGroup";
import type Voice from "../models/voice/Voice";

export default function createDecorationPass(voice: Voice) {
    const trackGroup = new TrackGroup({
        parent: voice,
        children: [],
    });

    const tracks = [
        new Track("StringItem", {
            parent: trackGroup,
            children: [],
        }),
        new Track("StringItem", {
            parent: trackGroup,
            children: [],
        }),
        new Track("StringItem", {
            parent: trackGroup,
            children: [],
        }),
        new Track("ChordItem", {
            parent: trackGroup,
            children: [],
        }),
    ];

    addChildren(trackGroup, ...tracks);
    addChildren(voice, trackGroup);
}
