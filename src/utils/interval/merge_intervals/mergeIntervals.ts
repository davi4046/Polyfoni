import type Interval from "../Interval";

export default function mergeIntervals(intervals: Interval[]): Interval[] {
    if (intervals.length <= 1) {
        return intervals.slice(); // Return a copy of the input array
    }

    // Sort intervals based on their start values
    intervals.sort((a, b) => a.start - b.start);

    const mergedIntervals: Interval[] = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
        const currentInterval = intervals[i];
        const lastMergedInterval = mergedIntervals[mergedIntervals.length - 1];

        if (currentInterval.start <= lastMergedInterval.end) {
            // Overlapping intervals, merge them
            lastMergedInterval.end = Math.max(
                lastMergedInterval.end,
                currentInterval.end
            );
        } else {
            // Non-overlapping interval, add a new interval to the result
            mergedIntervals.push({ ...currentInterval });
        }
    }

    return mergedIntervals;
}
