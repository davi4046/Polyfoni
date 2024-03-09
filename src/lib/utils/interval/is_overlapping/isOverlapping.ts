import type Interval from "../Interval";

export default function isOverlapping(a: Interval, b: Interval): Boolean {
    return (
        (a.start >= b.start && a.start < b.end) ||
        (a.end > b.start && a.end <= b.end)
    );
}
