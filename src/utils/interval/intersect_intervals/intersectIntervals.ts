import type Interval from "../Interval";

/**
 * Breaks down a set of intervals into the smallest non-overlapping intervals
 * and returns the resulting intervals.
 *
 * @param intervals An array of intervals.
 * @returns An array of non-overlapping intervals obtained from the input intervals.
 */
export function intersectIntervals(intervals: Interval[]): Interval[] {
    type Point = [number, string];

    let points: Point[] = intervals
        .flatMap((interval) => {
            return [
                [interval.start, "S"],
                [interval.end, "E"],
            ] as Point[];
        })
        .filter((value, index, array) => {
            return array.indexOf(value) === index;
        })
        .sort((a, b) => {
            return a[0] - b[0];
        });

    let result: Interval[] = [];

    let balance = 0;

    for (let i = 0; i < points.length - 1; i++) {
        let curr = points[i];
        let next = points[i + 1];

        if (curr[1] == "S") {
            balance += 1;
        } else {
            balance -= 1;
        }

        if (balance > 0 && curr[0] != next[0]) {
            result.push({ start: curr[0], end: next[0] });
        }
    }

    return result;
}
