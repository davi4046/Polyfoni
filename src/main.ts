import "./styles.css";

import { emit } from "@tauri-apps/api/event";
import { isRegistered, register } from "@tauri-apps/api/globalShortcut";

import App from "./App.svelte";

if (!(await isRegistered("CmdOrCtrl+I"))) {
    await register("CmdOrCtrl+I", () => {
        emit("insert");
    });
}

if (!(await isRegistered("Delete"))) {
    await register("Delete", () => {
        emit("delete");
    });
}

const app = new App({
    target: document.getElementById("app"),
});

export default app;
