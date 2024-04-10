<script lang="ts">
    import Timeline from "./timeline/user_interface/visuals/views/timeline/Timeline.svelte";
    import makeDemoTimeline from "./timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./timeline/user_interface/context/TimelineContext";
    import deleteSelectedItems from "./timeline/user_interface/context/operations/deleteSelectedItems";
    import cropHighlightedItems from "./timeline/user_interface/context/operations/cropHighlightedItems";
    import insertEmptyItems from "./timeline/user_interface/context/operations/insertEmptyItems";
    import selectHighlightedItems from "./timeline/user_interface/context/operations/selectHighlightedItems";
    import Generator from "./timeline/features/generation/Generator";
    import TotalHarmonyGenerator from "./timeline/features/generation/TotalHarmonyGenerator";
    import { listen } from "@tauri-apps/api/event";
    import { save } from "@tauri-apps/api/dialog";
    import createMidiFileFromTimeline from "./timeline/features/import_export/createMidiFileFromTimeline";
    import { onDestroy } from "svelte";
    import createTimelineVM from "./timeline/user_interface/vm_creators/timeline_vm/createTimelineVM";
    import { writeBinaryFile } from "@tauri-apps/api/fs";
    import copyHighlightedItems from "./timeline/user_interface/context/operations/copyHighlightedItems";
    import copySelectedItems from "./timeline/user_interface/context/operations/copySelectedItems";
    import pasteClipboard from "./timeline/user_interface/context/operations/pasteClipboard";
    import { registerShortcut } from "./utils/keyboard-shortcut";
    import loadFonts from "./utils/app-start/loadFonts";

    const timeline = makeDemoTimeline();
    const timelineContext = new TimelineContext(timeline);
    const timelineVM = createTimelineVM(timeline, timelineContext);

    new Generator(timeline);
    new TotalHarmonyGenerator(timeline);

    registerShortcut("delete", () => {
        timelineContext.history.startAction("Delete");
        deleteSelectedItems(timelineContext);
        cropHighlightedItems(timelineContext);
        timelineContext.history.endAction();
    });

    registerShortcut("insert", () => {
        timelineContext.history.startAction("Insert empty items");
        insertEmptyItems(timelineContext);
        timelineContext.history.endAction();
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
    });

    registerShortcut("ctrl+v", () => {
        pasteClipboard(timelineContext);
    });

    registerShortcut("ctrl+z", () => {
        timelineContext.history.undoAction();
    });

    registerShortcut("ctrl+shift+z", () => {
        timelineContext.history.redoAction();
    });

    const unlisten = listen("export_to_midi", async (_) => {
        const path = await save({
            title: "Export to MIDI",
            filters: [{ name: "MIDI", extensions: ["midi"] }],
        });

        if (!path) return;

        const buffer = await createMidiFileFromTimeline(timeline);
        writeBinaryFile(path, buffer);
    });

    onDestroy(async () => {
        (await unlisten)(); // avoid opening multiple save dialogs after hot reload
    });
</script>

{#await loadFonts() then}
    <main class="h-full">
        <Timeline vm={timelineVM}></Timeline>
    </main>
{/await}
