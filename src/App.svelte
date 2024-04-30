<script lang="ts">
    import Timeline from "./timeline/user_interface/visuals/views/timeline/Timeline.svelte";
    import makeDemoTimeline from "./timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./timeline/user_interface/context/TimelineContext";
    import deleteSelectedItems from "./timeline/user_interface/context/operations/deleteSelectedItems";
    import cropHighlightedItems from "./timeline/user_interface/context/operations/cropHighlightedItems";
    import insertEmptyItems from "./timeline/user_interface/context/operations/insertEmptyItems";
    import selectHighlightedItems from "./timeline/user_interface/context/operations/selectHighlightedItems";
    import Generator from "./timeline/features/generation/Generator";
    import HarmonicSumGenerator from "./timeline/features/generation/HarmonicSumGenerator";
    import { save } from "@tauri-apps/api/dialog";
    import createMidiFileFromTimeline from "./timeline/features/import_export/createMidiFileFromTimeline";
    import { onDestroy } from "svelte";
    import createTimelineVM from "./timeline/user_interface/vm_creators/timeline_vm/createTimelineVM";
    import { writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs";
    import copyHighlightedItems from "./timeline/user_interface/context/operations/copyHighlightedItems";
    import copySelectedItems from "./timeline/user_interface/context/operations/copySelectedItems";
    import pasteClipboard from "./timeline/user_interface/context/operations/pasteClipboard";
    import { registerShortcut } from "./utils/keyboard-shortcut";
    import loadFonts from "./utils/app_start/loadFonts";
    import { emit, listen } from "@tauri-apps/api/event";
    import AliasManager from "./timeline/features/generation/AliasManager";
    import StateHierarchyWatcher from "./architecture/StateHierarchyWatcher";
    import createXMLFileFromTimeline from "./timeline/features/import_export/createXMLFileFromTimeline";

    const timeline = makeDemoTimeline();
    const timelineContext = new TimelineContext(timeline);
    const timelineVM = createTimelineVM(timeline, timelineContext);

    const watcher = new StateHierarchyWatcher(timeline);

    const aliasManager = new AliasManager();

    aliasManager.init(watcher).then(() => {
        new Generator(watcher);
        new HarmonicSumGenerator(watcher);
    });

    registerShortcut("delete", () => {
        timelineContext.history.startAction();

        if (timelineContext.state.highlights.length > 0) {
            cropHighlightedItems(timelineContext);
            timelineContext.history.endAction("Cropped selection");
        } else {
            deleteSelectedItems(timelineContext);
            timelineContext.history.endAction("Deleted selected items");
        }
    });

    registerShortcut("insert", () => {
        timelineContext.history.startAction();

        const newItems = insertEmptyItems(timelineContext);

        timelineContext.history.endAction(
            newItems.length > 1
                ? `Inserted ${newItems.length} empty items`
                : `Inserted 1 empty item`
        );
    });

    registerShortcut("enter", () => {
        selectHighlightedItems(timelineContext);
    });

    registerShortcut("ctrl+c", () => {
        if (timelineContext.state.highlights.length > 0) {
            copyHighlightedItems(timelineContext);
        } else {
            copySelectedItems(timelineContext);
        }
        emit("display-message", {
            message: "Copied selection to clipbaord",
        });
    });

    registerShortcut("ctrl+v", () => {
        pasteClipboard(timelineContext);
        emit("display-message", {
            message: "Pasted clipboard",
        });
    });

    registerShortcut("ctrl+z", () => {
        timelineContext.history.undoAction();
    });

    registerShortcut("ctrl+shift+z", () => {
        timelineContext.history.redoAction();
    });

    const unlistenExportToMidi = listen("export_to_midi", async (_) => {
        const path = await save({
            title: "Export to MIDI",
            filters: [{ name: "MIDI", extensions: ["midi"] }],
        });

        if (!path) return;

        const buffer = await createMidiFileFromTimeline(timeline);
        writeBinaryFile(path, buffer);
    });

    let projectPath: string | undefined = undefined;

    async function saveAs() {
        const path = await save({
            title: "Save as",
            filters: [{ name: "Polyfoni Project", extensions: ["plfn"] }],
            defaultPath: projectPath,
        });

        if (!path) return;

        const xml = createXMLFileFromTimeline(timeline);
        writeTextFile(path, xml);
        projectPath = path;

        emit("display-message", { message: `Saved project to "${path}"` });
    }

    const unlistenSaveAs = listen("save_as", saveAs);

    const unlistenSave = listen("save", async (_) => {
        if (projectPath === undefined) {
            saveAs();
            return;
        }
        const xml = createXMLFileFromTimeline(timeline);
        writeTextFile(projectPath, xml);
        emit("display-message", { message: `Your changes have been saved` });
    });

    onDestroy(async () => {
        (await unlistenSaveAs)();
        (await unlistenSave)();
        (await unlistenExportToMidi)();
        // avoid opening multiple save dialogs after hot reload
    });

    let messages: string[] = [];

    listen("display-message", (event) => {
        const payload = event.payload as { message: string };

        messages = [payload.message, ...messages];

        setTimeout(() => {
            messages = messages.toSpliced(-1, 1);
        }, 3000);
    });
</script>

{#await loadFonts() then}
    <main class="h-full">
        <Timeline vm={timelineVM}></Timeline>
        <div
            class="absolute bottom-64 right-0 z-50 flex flex-col-reverse items-end overflow-clip"
        >
            {#each messages.slice(0, 5) as message}
                <div class="m-0.5 bg-black bg-opacity-75 px-4 py-2 text-white">
                    {message}
                </div>
            {/each}
        </div>
    </main>
{/await}
