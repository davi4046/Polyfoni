import Subscribable from "../../../../shared/subscribable/Subscribable";

class Interval extends Subscribable {
    constructor(
        public start: number,
        public end: number
    ) {
        super();
    }
}

export default Interval;
