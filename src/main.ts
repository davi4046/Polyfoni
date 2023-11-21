import "./styles.css";

import { emit } from "@tauri-apps/api/event";
import { register, unregister } from "@tauri-apps/api/globalShortcut";

import App from "./App.svelte";

/**
 * necessary to unregister global shortcuts (before creating app!!!)
 * for them to work properly during development
 */

unregister("CmdOrCtrl+I");
unregister("Delete");

const app = new App({
    target: document.getElementById("app"),
});

export default app;

//register global shortcuts as a fix for tauri's accelerators not working on Windows

register("CmdOrCtrl+I", (_) => {
    emit("insert");
});
register("Delete", (_) => {
    emit("delete");
});
