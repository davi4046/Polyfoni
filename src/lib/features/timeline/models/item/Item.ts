import Model from "../../../../shared/model/Model";

import type Interval from "../interval/Interval";
import type Track from "../track/Track";

class Item extends Model {
    constructor(
        public track: Track,
        public interval: Interval,
        public content: string
    ) {
        super();
    }
}

export default Item;
