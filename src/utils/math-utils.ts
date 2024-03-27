export default function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    if (inMin === inMax) return outMin;
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
