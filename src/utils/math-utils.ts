export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    if (inMin === inMax) return outMin;
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function circWrap(value: number, rmin: number, rmax: number): number {
    const range = rmax - rmin;
    while (value >= rmax) value -= range;
    while (value < rmin) value += range;
    return value;
}

export function minCircDist(
    a: number,
    b: number,
    rmin: number,
    rmax: number
): number {
    const r = circWrap(a - b, rmin, rmax);
    const l = circWrap(b - a, rmin, rmax);
    return r < l ? r : -l;
}

export function maxCircDist(
    a: number,
    b: number,
    rmin: number,
    rmax: number
): number {
    const r = circWrap(a - b, rmin, rmax);
    const l = circWrap(b - a, rmin, rmax);
    return r < l ? -l : r;
}

export function circClosestIndex(
    value: number,
    array: number[],
    rmin: number,
    rmax: number
): number {
    return array
        .map((num) => Math.abs(minCircDist(value, num, rmin, rmax)))
        .reduce((minIndex, _, currIndex, array) => {
            return array[minIndex] < array[currIndex] ? minIndex : currIndex;
        }, Number.MAX_SAFE_INTEGER);
}
