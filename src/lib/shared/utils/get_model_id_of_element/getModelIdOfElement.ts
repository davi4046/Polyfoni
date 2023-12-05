function getModelIdOfElement(element: Element): string {
    const modelId = element.getAttribute("data-model-id");

    if (!modelId) {
        throw new Error("Failed to get model id of element");
    }

    return modelId;
}

export default getModelIdOfElement;
