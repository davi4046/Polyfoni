import Model from "../../../../shared/model/Model";

import type Interval from "../interval/Interval";

class Item extends Model {
    constructor(
        public interval: Interval,
        public content: string
    ) {
        super();
    }
}

export default Item;
