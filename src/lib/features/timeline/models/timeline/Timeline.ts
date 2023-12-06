import Model from "../../../../shared/model/Model";
import Section from "../section/Section";

import type Voice from "../voice/Voice";

class Timeline extends Model {
    readonly top: Section;
    readonly center: Section;
    readonly bottom: Section;

    constructor(voices: Voice[]) {
        super();
        this.top = new Section(this, []);
        this.center = new Section(this, voices);
        this.bottom = new Section(this, []);
    }
}

export default Timeline;
