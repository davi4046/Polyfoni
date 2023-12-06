import type Item from "../../models/item/Item";

function offsetItems(
    items: Item[],
    beatOffset: number,
    trackOffset: number,
    voiceOffset: number
) {
    items.forEach((item) => {
        const newStart = item.start + beatOffset;
        const newEnd = newStart + item.end - item.start;

        let newTrack = item.track;

        const voice = item.track.voice;
        const timeline = voice?.timeline;

        if (voice && timeline) {
            const trackIndex = voice.tracks.indexOf(item.track);
            const voiceIndex = timeline.voices.indexOf(voice);

            const newTrackIndex = trackIndex + trackOffset;
            const newVoiceIndex = voiceIndex + voiceOffset;

            newTrack = timeline.voices[newVoiceIndex].tracks[newTrackIndex];
        }

        item.start = newStart;
        item.end = newEnd;
        item.track = newTrack;
    });
}

export default offsetItems;
