import App from "./App.svelte";
import "./styles.css";

import "./utils/html_classes/adjust-width-to-height";
import "core-js";

const app = new App({
    target: document.getElementById("app")!,
});

export default app;
