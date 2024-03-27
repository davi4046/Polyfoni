import './styles.css';
import './utils/html_classes/adjust-width-to-height';
import 'tippy.js/dist/tippy.css';

import App from './App.svelte';

const app = new App({
    target: document.getElementById("app")!,
});

export default app;
