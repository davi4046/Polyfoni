import type Voice from "../voice/Voice";
import Track from "../track/Track";

class TimelineModel {
    public harmonicSumTrack = new Track("Harmonic Sum", []);

    constructor(public voices: Voice[]) {}
}

export default TimelineModel;
