import { addChildren } from "../../architecture/state-hierarchy-utils";
import Track from "../models/track/Track";
import TrackGroup from "../models/track_group/TrackGroup";
import type Voice from "../models/voice/Voice";

export default function createDecorationPass(voice: Voice) {
    const trackGroup = new TrackGroup({
        role: "voice_decoration",
        parent: voice,
        children: [],
    });

    const tracks = [
        new Track("StringItem", {
            role: "pitch",
            parent: trackGroup,
            children: [],
            allowUserEdit: true,
        }),
        new Track("StringItem", {
            role: "duration",
            parent: trackGroup,
            children: [],
            allowUserEdit: true,
        }),
        new Track("StringItem", {
            role: "rest",
            parent: trackGroup,
            children: [],
            allowUserEdit: true,
        }),
        new Track("ChordItem", {
            role: "harmony",
            parent: trackGroup,
            children: [],
            allowUserEdit: true,
        }),
    ];

    addChildren(trackGroup, ...tracks);
    addChildren(voice, trackGroup);
}
