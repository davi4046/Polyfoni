import Model from "../../../../shared/model/Model";

class Interval extends Model {
    constructor(
        public start: number,
        public end: number
    ) {
        super();
    }
}

export default Interval;
