import App from "./App.svelte";
import "./styles.css";

import "./lib/utils/html_classes/adjust-width-to-height";

const app = new App({
    target: document.getElementById("app"),
});

export default app;
