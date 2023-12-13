import clamp from "../../../../shared/utils/math_utils/clamp/clamp";

import type Item from "../../models/item/Item";

function offsetItems(
    items: Item[],
    beatOffset: number,
    trackOffset: number,
    voiceOffset: number
) {
    const section = items[0].state.track.state.voice.state.section;

    items.forEach((item) => {
        if (item.state.track.state.voice.state.section !== section)
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
        const index = item.state.track.state.voice.state.tracks.indexOf(
            item.state.track
        );
        return Math.min(min, index);
    }, Number.MAX_VALUE);

    const maxTrackIndex = items.reduce((max, item) => {
        const index = item.state.track.state.voice.state.tracks.indexOf(
            item.state.track
        );

        return Math.max(max, index);
    }, Number.MIN_VALUE);

    trackOffset = clamp(trackOffset, -minTrackIndex, 4 - maxTrackIndex);

    /* Clamp Voice Offset  */

    const minVoiceIndex = items.reduce((min, item) => {
        const index =
            item.state.track.state.voice.state.section.state.voices.indexOf(
                item.state.track.state.voice
            );
        return Math.min(min, index);
    }, Number.MAX_VALUE);

    const maxVoiceIndex = items.reduce((max, item) => {
        const index =
            item.state.track.state.voice.state.section.state.voices.indexOf(
                item.state.track.state.voice
            );
        return Math.max(max, index);
    }, Number.MIN_VALUE);

    const voiceCount = section.state.voices.length;

    voiceOffset = clamp(
        voiceOffset,
        -minVoiceIndex,
        voiceCount - maxVoiceIndex - 1
    );

    /* Offset Items */

    items.forEach((item) => {
        const newStart = item.state.start + beatOffset;
        const newEnd = newStart + item.state.end - item.state.start;

        const track = item.state.track;
        const voice = track.state.voice;
        const section = voice.state.section;

        const trackIndex = voice.state.tracks.indexOf(track);
        const voiceIndex = section.state.voices.indexOf(voice);

        const newTrackIndex = trackIndex + trackOffset;
        const newVoiceIndex = voiceIndex + voiceOffset;

        const newTrack =
            section.state.voices[newVoiceIndex].state.tracks[newTrackIndex];

        item.state.setState({
            track: newTrack,
            start: newStart,
            end: newEnd,
            content: item.state.content,
        });
    });
}

export default offsetItems;
