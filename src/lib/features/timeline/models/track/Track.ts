import Model from "../../../../shared/model/Model";

import type Item from "../item/Item";

class Track extends Model {
    constructor(
        public label: string,
        public items: Item[]
    ) {
        super();
    }
}

export default Track;
