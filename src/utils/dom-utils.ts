export default function findClosestElement<T extends Element>(
    x: number,
    y: number,
    elements: T[]
): T {
    let closestElement: T = elements[0];
    let minDistance = Number.MAX_SAFE_INTEGER;

    elements.forEach((element) => {
        const boundingBox = element.getBoundingClientRect();
        const elementX = boundingBox.left + boundingBox.width / 2;
        const elementY = boundingBox.top + boundingBox.height / 2;

        const distance = Math.sqrt(
            Math.pow(x - elementX, 2) + Math.pow(y - elementY, 2)
        );

        if (distance >= minDistance) return;

        minDistance = distance;
        closestElement = element;
    });

    return closestElement;
}
