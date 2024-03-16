export default function convertToInlineStyles(
    obj: Record<string, string>
): string {
    return Object.entries(obj)
        .map(([property, value]) => {
            return `${property}:${value}`;
        })
        .join(";");
}
