function findElementByModelId(rootElement: Element, modelId: string): Element {
    const element = rootElement.querySelector(`[data-model-id='${modelId}']`);

    if (!element) {
        throw new Error(`Failed to find element with model id: ${modelId}`);
    }

    return element;
}

export default findElementByModelId;
