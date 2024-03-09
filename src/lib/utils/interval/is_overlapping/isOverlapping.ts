import type Interval from "../Interval";

export default function isOverlapping(a: Interval, b: Interval): Boolean {
    return (
        (a.start >= b.start && a.start < b.end) || // Start of A is within B
        (a.end > b.start && a.end <= b.end) || // End of A is within B
        (a.start <= b.start && a.end >= b.end) // A contains B
    );
}
