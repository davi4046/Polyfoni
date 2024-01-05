import {
    getGrandparent,
    getGreatGrandparent,
    getIndex,
    getParent,
    getPosition,
    isGreaterPos,
} from "../../../../shared/architecture/state/state_utils";

import type Track from "../../models/track/Track";

function getTracksInRange(
    startTrack: Track<any>,
    endTrack: Track<any>
): Track<any>[] {
    const timeline = getGreatGrandparent(startTrack);

    if (getGreatGrandparent(endTrack) !== timeline) {
        throw new Error(
            "startTrack and endTrack must reference the same Timeline as parent"
        );
    }

    const startPos = getPosition(startTrack);
    const endPos = getPosition(endTrack);

    const isStartTrackFirst = isGreaterPos(endPos, startPos);

    const minTrack = isStartTrackFirst ? startTrack : endTrack;
    const maxTrack = isStartTrackFirst ? endTrack : startTrack;

    const minVoice = getParent(minTrack);
    const maxVoice = getParent(maxTrack);

    const minSection = getGrandparent(minTrack);
    const maxSection = getGrandparent(maxTrack);

    const sections = timeline.state.children.slice(
        getIndex(minSection),
        getIndex(maxSection) + 1
    );

    const voices = sections.flatMap((section) => {
        const start = section === minSection ? getIndex(minVoice) : undefined;
        const end = section === maxSection ? getIndex(maxVoice) + 1 : undefined;
        return section.state.children.slice(start, end);
    });

    const tracks = voices.flatMap((voice) => {
        const start = voice === minVoice ? getIndex(minTrack) : undefined;
        const end = voice === maxVoice ? getIndex(maxTrack) + 1 : undefined;
        return voice.state.children.slice(start, end);
    });

    return tracks;
}

export default getTracksInRange;
