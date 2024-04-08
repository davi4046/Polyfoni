import * as midi from "@perry-rylance/midi";

import { trackTypeToIndex } from "../generation/track-config";
import { deriveTempoChangesFromItems } from "../../utils/tempo-utils";
import { getChildren } from "../../../architecture/state-hierarchy-utils";
import type Timeline from "../../models/timeline/Timeline";
import type Track from "../../models/track/Track";

export default async function createMidiFileFromTimeline(
    timeline: Timeline
): Promise<ArrayBuffer> {
    const voices = getChildren(getChildren(timeline)[1]);

    const outputTracks: Track<"NoteItem">[] = voices.map(
        (voice) =>
            getChildren(getChildren(voice)[0])[trackTypeToIndex("output")]
    );

    const midiFile = new midi.File();

    const eventTrack = new midi.Track();

    const timeSignatureEvent = new midi.TimeSignatureEvent();
    timeSignatureEvent.numerator = 4;
    timeSignatureEvent.denominator = 4;
    eventTrack.events.push(timeSignatureEvent);

    const tempoItems = getChildren(timeline.tempoTrack).slice();
    const tempoChanges = await deriveTempoChangesFromItems(tempoItems, 60);

    for (let i = 0; i < tempoChanges.length; i++) {
        const prevChange = tempoChanges[i - 1];
        const currChange = tempoChanges[i];

        const tempoEvent = new midi.SetTempoEvent();

        tempoEvent.delta = prevChange
            ? currChange.beat - prevChange.beat
            : currChange.beat;
        tempoEvent.delta *= 480;

        tempoEvent.bpm = currChange.tempo;

        eventTrack.events.push(tempoEvent);
    }

    eventTrack.events.push(new midi.EndOfTrackEvent());

    midiFile.tracks.push(eventTrack);

    outputTracks.forEach((track) => {
        const midiTrack = new midi.Track();

        const notes = getChildren(track).slice();
        notes.sort((a, b) => a.state.start - b.state.start);

        for (let i = 0; i < notes.length; i++) {
            const prevNote = notes[i - 1];
            const currNote = notes[i];

            const noteOnEvent = new midi.NoteOnEvent();
            const noteOffEvent = new midi.NoteOffEvent();

            const startDeltaBeat = prevNote
                ? currNote.state.start - prevNote.state.end
                : currNote.state.start;
            const endDeltaBeat = currNote.state.end - currNote.state.start;

            noteOnEvent.delta = Math.round(startDeltaBeat * 480);
            noteOffEvent.delta = Math.round(endDeltaBeat * 480);

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
