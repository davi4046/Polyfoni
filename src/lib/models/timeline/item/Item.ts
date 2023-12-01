import type Interval from "../interval/Interval";

class Item {
    constructor(
        public interval: Interval,
        public content: string
    ) {}
}

export default Item;
