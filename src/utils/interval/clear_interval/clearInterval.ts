import type Interval from "../Interval";

/**
 * Adjusts intervals in the provided list so that none overlap the specified interval.
 * Removes intervals that are completely overlapped by the specified interval.
 */
export default function clearInterval(
    list: Interval[],
    interval: Interval
): void {
    if (list.length === 0) return;

    list.sort((a, b) => a.start - b.start);

    //last item starting before interval
    let i = list.findLast((item) => {
        return item.start < interval.start;
    });
    //first item ending after interval
    let j = list.find((item) => {
        return item.end > interval.end;
    });

    if (i === j && i) {
        //because i and j is the same interval, we split it
        const newInterval = Object.assign({}, i); //keep data associated with 'i'
        newInterval.start = interval.end;
        newInterval.end = i.end;
        i.end = interval.start;
        list.push(newInterval);
    } else {
        //remove items between i and j
        list.slice(
            i ? list.indexOf(i) + 1 : 0,
            j ? list.indexOf(j) : list.length
        ).forEach((child) => {
            const index = list.indexOf(child);
            list.splice(index, 1);
        });
        //crop i and j so they aren't overlapping the interval
        if (i) {
            i.end = Math.min(interval.start, i.end);
        }
        if (j) {
            j.start = Math.max(interval.end, j.start);
        }
    }
}
