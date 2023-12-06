import Model from "../../../../shared/model/Model";
import Track from "../track/Track";

import type Section from "../section/Section";

class Voice extends Model {
    public tracks: Track[];

    constructor(
        public section: Section,
        public label: string
    ) {
        super();
        this.tracks = [
            new Track(this, label, []),
            new Track(this, "Pitch", []),
            new Track(this, "Duration", []),
            new Track(this, "Rest", []),
            new Track(this, "Harmony", []),
        ];
    }
}

export default Voice;
