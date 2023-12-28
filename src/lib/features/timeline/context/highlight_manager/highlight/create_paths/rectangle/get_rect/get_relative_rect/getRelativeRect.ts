function getRelativeRect(
    element1: HTMLElement,
    element2: HTMLElement
): DOMRect {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const relativeRect = new DOMRect(
        rect1.left - rect2.left,
        rect1.top - rect2.top,
        rect1.width,
        rect1.height
    );

    return relativeRect;
}

export default getRelativeRect;
