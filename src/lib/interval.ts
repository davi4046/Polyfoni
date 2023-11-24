export type Interval = [start: number, end: number];

/**
 * Computes the set difference between two lists of intervals.
 * Subtracts intervals in list B from intervals in list A.
 *
 * @param A - The list of intervals to subtract from (minuend).
 * @param B - The list of intervals to subtract (subtrahend).
 * @returns The list of intervals resulting from subtracting intervals in B from intervals in A.
 */
export function subtractIntervals(A: Interval[], B: Interval[]): Interval[] {
    const result: Interval[] = [];

    for (const intervalA of A) {
        let remainingInterval = intervalA;

        for (const intervalB of B) {
            const overlapStart = Math.max(remainingInterval[0], intervalB[0]);
            const overlapEnd = Math.min(remainingInterval[1], intervalB[1]);

            if (overlapStart < overlapEnd) {
                // There is an overlap, update remainingInterval
                if (remainingInterval[0] < intervalB[0]) {
                    result.push([remainingInterval[0], overlapStart]);
                }

                remainingInterval = [overlapEnd, remainingInterval[1]];
            }
        }

        if (remainingInterval[0] < remainingInterval[1]) {
            // Add the remaining interval to the result
            result.push(remainingInterval);
        }
    }

    return result;
}

/**
 * Merges overlapping intervals in a list of intervals.
 *
 * @param intervals - The input list of intervals to be merged.
 * @returns The list of intervals after merging overlapping intervals.
 */
export function mergeIntervals(intervals: Interval[]): Interval[] {
    return intervals.reduce((result: Interval[], currentInterval) => {
        const lastMergedInterval = result[result.length - 1];

        if (lastMergedInterval && currentInterval[0] <= lastMergedInterval[1]) {
            // There is an overlap, merge intervals
            lastMergedInterval[1] = Math.max(
                lastMergedInterval[1],
                currentInterval[1]
            );
        } else {
            // No overlap, add the current interval to the result
            result.push(currentInterval);
        }

        return result;
    }, []);
}

/**
 * Breaks down a set of intervals into the smallest non-overlapping intervals
 * and returns the resulting intervals.
 *
 * @param intervals An array of intervals represented as arrays of two numbers.
 * @returns An array of non-overlapping intervals obtained from the input intervals.
 */
export function intersectIntervals(intervals: Interval[]): Interval[] {
    type Point = [number, string];

    let points: Point[] = intervals
        .flatMap((interval) => {
            return [
                [interval[0], "S"],
                [interval[1], "E"],
            ] as Point[];
        })
        .filter((value, index, array) => {
            return array.indexOf(value) === index;
        })
        .sort((a, b) => {
            return a[0] - b[0];
        });

    let result: Interval[] = [];

    let prev = points[0];

    for (let i = 1; i < points.length; i++) {
        let curr = points[i];

        if ((prev[1] != "E" || curr[1] != "S") && prev[0] != curr[0]) {
            result.push([prev[0], curr[0]]);
            prev = curr;
        }
    }

    return result;
}
