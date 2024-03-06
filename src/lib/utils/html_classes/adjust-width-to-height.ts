const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
                if (
                    node instanceof HTMLElement &&
                    node.matches(".adjust-width-to-height")
                ) {
                    node.style.width = `${node.offsetHeight}px`;
                }
            });
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
