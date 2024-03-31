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
    import { writeBinaryFile } from "@tauri-apps/api/fs";
    import { onDestroy } from "svelte";
    import createTimelineVM from "./timeline/user_interface/vm_creators/createTimelineVM";
    import hotkeys from "hotkeys-js";

    const timeline = makeDemoTimeline();
    const timelineContext = new TimelineContext(timeline);
    const timelineVM = createTimelineVM(timeline, timelineContext);

    new Generator(timeline);
    new TotalHarmonyGenerator(timeline);

    hotkeys.unbind("delete");
    hotkeys.unbind("insert");
    hotkeys.unbind("enter");

    hotkeys("delete", () => {
        deleteSelectedItems(timelineContext);
        cropHighlightedItems(timelineContext);
    });

    hotkeys("insert", () => {
        insertEmptyItems(timelineContext);
    });

    hotkeys("enter", () => {
        selectHighlightedItems(timelineContext);
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
        (await unlisten)();
    });
</script>

<main class="h-full">
    <Timeline vm={timelineVM}></Timeline>
</main>
