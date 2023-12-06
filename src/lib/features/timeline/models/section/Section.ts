import Model from "../../../../shared/model/Model";

import type Timeline from "../timeline/Timeline";
import type Voice from "../voice/Voice";

class Section extends Model {
    constructor(
        public timeline: Timeline,
        public voices: Voice[]
    ) {
        super();
    }
}

export default Section;
