import Subscribable from "../../../../shared/subscribable/Subscribable";

import type Interval from "../interval/Interval";

class Item extends Subscribable {
    constructor(
        public interval: Interval,
        public content: string
    ) {
        super();
    }
}

export default Item;
