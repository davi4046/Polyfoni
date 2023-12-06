import Model from "../../../../shared/model/Model";

import type Item from "../item/Item";
import type Voice from "../voice/Voice";

class Track extends Model {
    constructor(
        public voice: Voice,
        public label: string,
        public items: Item[]
    ) {
        super();
    }
}

export default Track;
