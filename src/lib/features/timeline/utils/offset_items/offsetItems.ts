import clamp from "../../../../shared/utils/math_utils/clamp/clamp";

import type Item from "../../models/item/Item";

function offsetItems(
    items: Item[],
    beatOffset: number,
    trackOffset: number,
    voiceOffset: number
) {
    const section = items[0].state.parent.state.parent.state.parent;

    items.forEach((item) => {
        if (item.state.parent.state.parent.state.parent !== section)
            throw new Error(
                "Failed to offset items, all items' voices must reference the same section"
            );
    });

    /* Clamp Beat Offset */

    const minBeat = items.reduce(
        (min, item) => Math.min(min, item.state.start),
        Number.MAX_VALUE
    );

    beatOffset = Math.max(beatOffset, -minBeat);

    /* Clamp Track Offset */

    const minTrackIndex = items.reduce((min, item) => {
        const index = item.state.parent.state.parent.state.children.indexOf(
            item.state.parent
        );
        return Math.min(min, index);
    }, Number.MAX_VALUE);

    const maxTrackIndex = items.reduce((max, item) => {
        const index = item.state.parent.state.parent.state.children.indexOf(
            item.state.parent
        );

        return Math.max(max, index);
    }, Number.MIN_VALUE);

    trackOffset = clamp(trackOffset, -minTrackIndex, 4 - maxTrackIndex);

    /* Clamp Voice Offset  */

    const minVoiceIndex = items.reduce((min, item) => {
        const index =
            item.state.parent.state.parent.state.parent.state.children.indexOf(
                item.state.parent.state.parent
            );
        return Math.min(min, index);
    }, Number.MAX_VALUE);

    const maxVoiceIndex = items.reduce((max, item) => {
        const index =
            item.state.parent.state.parent.state.parent.state.children.indexOf(
                item.state.parent.state.parent
            );
        return Math.max(max, index);
    }, Number.MIN_VALUE);

    const voiceCount = section.state.children.length;

    voiceOffset = clamp(
        voiceOffset,
        -minVoiceIndex,
        voiceCount - maxVoiceIndex - 1
    );

    /* Offset Items */

    items.forEach((item) => {
        const newStart = item.state.start + beatOffset;
        const newEnd = newStart + item.state.end - item.state.start;

        const track = item.state.parent;
        const voice = track.state.parent;
        const section = voice.state.parent;

        const trackIndex = voice.state.children.indexOf(track);
        const voiceIndex = section.state.children.indexOf(voice);

        const newTrackIndex = trackIndex + trackOffset;
        const newVoiceIndex = voiceIndex + voiceOffset;

        const newTrack =
            section.state.children[newVoiceIndex].state.children[newTrackIndex];

        item.state = {
            parent: newTrack,
            start: newStart,
            end: newEnd,
            content: item.state.content,
        };
    });
}

export default offsetItems;
