import Subscribable from "../../../../shared/subscribable/Subscribable";
import Track from "../track/Track";

class Voice extends Subscribable {
    public pitchTrack = new Track("Pitch", []);
    public durationTrack = new Track("Duration", []);
    public restTrack = new Track("Rest", []);
    public harmonyTrack = new Track("Harmony", []);
    public outputTrack: Track;

    constructor(public label: string) {
        super();
        this.outputTrack = new Track(label, []);
    }
}

export default Voice;
