import type Voice from "../voice/Voice";
import Model from "../../../../shared/model/Model";
import Track from "../track/Track";

class Timeline extends Model {
    public harmonicSumTrack = new Track(null, "Harmonic Sum", []);

    constructor(public voices: Voice[]) {
        super();
    }
}

export default Timeline;
