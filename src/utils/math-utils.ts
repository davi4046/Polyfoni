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
