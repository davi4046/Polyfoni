function findElementByModelId(modelId: string) {
    return document.querySelector(`[data-model-id='${modelId}']`);
}

export default findElementByModelId;
