import "tippy.js/dist/tippy.css";
import "tippy.js/themes/material.css";

import App from "./App.svelte";
import "./styles.css";

import "./utils/html_classes/adjust-width-to-height";

const app = new App({
    target: document.getElementById("app")!,
});

export default app;
