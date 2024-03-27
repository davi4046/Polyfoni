import * as midi from "@perry-rylance/midi";

import { getChildren } from "../../architecture/state-hierarchy-utils";
import type Timeline from "../timeline/models/Timeline";
import type Track from "../timeline/models/Track";
import { trackTypeToIndex } from "../timeline/utils/track-config";

export default function createMidiFileFromTimeline(
    timeline: Timeline
): ArrayBuffer {
    const voices = getChildren(getChildren(timeline)[1]);

    const outputTracks: Track<"NoteItem">[] = voices.map(
        (voice) => getChildren(voice)[trackTypeToIndex("output")]
    );

    const midiFile = new midi.File();

    outputTracks.forEach((track) => {
        const midiTrack = new midi.Track();

        const timeSignatureEvent = new midi.TimeSignatureEvent();
        timeSignatureEvent.numerator = 4;
        timeSignatureEvent.denominator = 4;

        midiTrack.events.push(timeSignatureEvent);

        const notes = getChildren(track).slice();
        notes.sort((a, b) => a.state.start - b.state.start);

        for (let i = 0; i < notes.length; i++) {
            const prevNote = notes[i - 1];
            const currNote = notes[i];

            const noteOnEvent = new midi.NoteOnEvent();
            const noteOffEvent = new midi.NoteOffEvent();

            noteOnEvent.delta = prevNote
                ? currNote.state.start - prevNote.state.end
                : currNote.state.start;
            noteOffEvent.delta = currNote.state.end - currNote.state.start;

            noteOnEvent.delta *= 480;
            noteOffEvent.delta *= 480;

            noteOnEvent.key = currNote.state.content;
            noteOffEvent.key = currNote.state.content;

            midiTrack.events.push(noteOnEvent, noteOffEvent);
        }

        midiTrack.events.push(new midi.EndOfTrackEvent());
        midiFile.tracks.push(midiTrack);
    });

    const writeStream = new midi.WriteStream();
    midiFile.writeBytes(writeStream);

    return writeStream.toArrayBuffer();
}
