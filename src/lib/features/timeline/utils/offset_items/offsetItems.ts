import type Item from "../../models/item/Item";

function offsetItems(
    items: Item[],
    beatOffset: number,
    trackOffset: number,
    voiceOffset: number
) {
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
