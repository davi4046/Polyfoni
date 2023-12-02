import type Item from "../item/Item";

class Track {
    constructor(
        public label: string,
        public items: Item[]
    ) {}
}

export default Track;
