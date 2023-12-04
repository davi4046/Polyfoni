function findClosestElement(
    x: number,
    y: number,
    elements: Element[]
): Element | null {
    let closestElement: Element | null = null;
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

export default findClosestElement;
