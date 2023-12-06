import Model from "../../../../shared/model/Model";

import type Track from "../track/Track";

class Item extends Model {
    constructor(
        public track: Track,
        public start: number,
        public end: number,
        public content: string
    ) {
        super();
    }
}

export default Item;
