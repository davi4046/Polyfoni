<script lang="ts">
    import Timeline from "./lib/features/timeline/visuals/views/timeline/Timeline.svelte";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./lib/features/timeline/context/TimelineContext";
    import createTimelineVM from "./lib/features/timeline/vm_creators/createTimelineVM";
    import ShortcutManager from "./lib/architecture/ShortcutManager";
    import deleteSelectedItems from "./lib/features/timeline/context/operations/deleteSelectedItems";
    import cropHighlightedItems from "./lib/features/timeline/context/operations/cropHighlightedItems";
    import insertEmptyItems from "./lib/features/timeline/context/operations/insertEmptyItems";
    import selectHighlightedItems from "./lib/features/timeline/context/operations/selectHighlightedItems";
    import Generator from "./lib/features/generation/Generator";
    import TotalHarmonyGenerator from "./lib/features/generation/TotalHarmonyGenerator";
    import { listen } from "@tauri-apps/api/event";
    import { save } from "@tauri-apps/api/dialog";
    import createMidiFileFromTimeline from "./lib/features/export/createMidiFileFromTimeline";
    import { writeBinaryFile } from "@tauri-apps/api/fs";
    import { onDestroy } from "svelte";

    const timeline = makeDemoTimeline();
    const timelineContext = new TimelineContext(timeline);
    const timelineVM = createTimelineVM(timeline, timelineContext);

    new Generator(timeline);
    new TotalHarmonyGenerator(timeline);

    const shortcutManager = new ShortcutManager();

    shortcutManager.register("Delete", () => {
        deleteSelectedItems(timelineContext);
        cropHighlightedItems(timelineContext);
    });

    shortcutManager.register("Insert", () => {
        insertEmptyItems(timelineContext);
    });

    shortcutManager.register("Enter", () => {
        selectHighlightedItems(timelineContext);
    });

    const unlisten = listen("export_to_midi", async (_) => {
        const path = await save({
            title: "Export to MIDI",
            filters: [{ name: "MIDI", extensions: ["midi"] }],
        });

        if (!path) return;

        const buffer = createMidiFileFromTimeline(timeline);
        writeBinaryFile(path, buffer);
    });

    onDestroy(async () => {
        (await unlisten)();
    });
</script>

<main class="h-full">
    <Timeline vm={timelineVM}></Timeline>
</main>
