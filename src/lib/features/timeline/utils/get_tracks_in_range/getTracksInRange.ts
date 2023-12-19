import {
    getChildren,
    getGrandparent,
    getGreatGrandparent,
    getIndex,
    getParent,
} from "../../../../shared/state/state_utils";

import type Track from "../../models/track/Track";

function getTracksInRange(start: Track, end: Track): Track[] {
    if (getGreatGrandparent(start) !== getGreatGrandparent(end)) {
        throw new Error("start and end must reference the same Timeline");
    }

    const [minTrack, maxTrack] = [start, end].sort(
        (a, b) => getIndex(a) - getIndex(b)
    );

    const [minVoice, maxVoice] = [start, end]
        .map(getParent)
        .sort((a, b) => getIndex(a) - getIndex(b));

    const [minSection, maxSection] = [start, end]
        .map(getGrandparent)
        .sort((a, b) => getIndex(a) - getIndex(b));

    if (minTrack === maxTrack) {
        return [minTrack];
    }

    if (minVoice === maxVoice) {
        return getChildren(getParent(minTrack)).slice(
            getIndex(minTrack),
            getIndex(maxTrack) + 1
        );
    }

    const tracks: Track[] = [];

    tracks.push(
        ...getChildren(minVoice).slice(
            getIndex(minTrack),
            getChildren(minVoice).length
        )
    );

    tracks.push(...getChildren(maxVoice).slice(0, getIndex(maxTrack) + 1));

    if (minSection === maxSection) {
        tracks.push(
            ...getChildren(getParent(minVoice))
                .slice(getIndex(minVoice) + 1, getIndex(maxVoice))
                .map(getChildren)
                .flat()
        );
        return tracks;
    }

    tracks.push(
        ...getChildren(minSection)
            .slice(
                getIndex(minSection),
                getChildren(getParent(minSection)).length
            )
            .map(getChildren)
            .flat()
    );

    tracks.push(
        ...getChildren(maxSection)
            .slice(0, getIndex(maxVoice) + 1)
            .map(getChildren)
            .flat()
    );

    return tracks;
}

export default getTracksInRange;
