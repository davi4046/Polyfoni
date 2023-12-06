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

        const track = item.track;
        const voice = track.voice;
        const section = voice.section;

        const trackIndex = voice.tracks.indexOf(track);
        const voiceIndex = section.voices.indexOf(voice);

        const newTrackIndex = trackIndex + trackOffset;
        const newVoiceIndex = voiceIndex + voiceOffset;

        const newTrack = section.voices[newVoiceIndex].tracks[newTrackIndex];

        item.start = newStart;
        item.end = newEnd;
        item.track = newTrack;
    });
}

export default offsetItems;
