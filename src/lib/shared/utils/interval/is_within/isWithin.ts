import type Interval from "../Interval";

/**
 * @returns true if the value is within the interval, otherwise false
 */
function isWithin(value: number, interval: Interval): Boolean {
    return value >= interval.start && value <= interval.end;
}

export default isWithin;
