import Subscribable from "../../../../shared/subscribable/Subscribable";

import type Item from "../item/Item";

class Track extends Subscribable {
    constructor(
        public label: string,
        public items: Item[]
    ) {
        super();
    }
}

export default Track;
