import type Voice from "../voice/Voice";
import Subscribable from "../../../../shared/subscribable/Subscribable";
import Track from "../track/Track";

class Timeline extends Subscribable {
    public harmonicSumTrack = new Track("Harmonic Sum", []);

    constructor(public voices: Voice[]) {
        super();
    }
}

export default Timeline;
