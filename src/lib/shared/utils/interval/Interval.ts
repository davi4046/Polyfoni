class Interval<T = undefined> {
    constructor(
        public start: number,
        public end: number,
        public data?: T
    ) {}
}

export default Interval;
