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
    import createTimelineVM from "./timeline/user_interface/vm_creators/createTimelineVM";
    import hotkeys from "hotkeys-js";
    import { readDir, writeBinaryFile } from "@tauri-apps/api/fs";
    import { resolveResource } from "@tauri-apps/api/path";
    import { convertFileSrc } from "@tauri-apps/api/tauri";
    import copyHighlightedItems from "./timeline/user_interface/context/operations/copyHighlightedItems";
    import copySelectedItems from "./timeline/user_interface/context/operations/copySelectedItems";
    import pasteClipboard from "./timeline/user_interface/context/operations/pasteClipboard";

    const timeline = makeDemoTimeline();
    const timelineContext = new TimelineContext(timeline);
    const timelineVM = createTimelineVM(timeline, timelineContext);

    new Generator(timeline);
    new TotalHarmonyGenerator(timeline);

    hotkeys("delete", () => {
        timelineContext.history.startAction("Delete");
        deleteSelectedItems(timelineContext);
        cropHighlightedItems(timelineContext);
        timelineContext.history.endAction();
    });

    hotkeys("insert", () => {
        timelineContext.history.startAction("Insert empty items");
        insertEmptyItems(timelineContext);
        timelineContext.history.endAction();
    });

    hotkeys("enter", () => {
        selectHighlightedItems(timelineContext);
    });

    hotkeys("ctrl+c", () => {
        if (timelineContext.state.highlights.length > 0) {
            copyHighlightedItems(timelineContext);
        } else {
            copySelectedItems(timelineContext);
        }
    });

    hotkeys("ctrl+v", () => {
        pasteClipboard(timelineContext);
    });

    hotkeys("ctrl+z", () => {
        timelineContext.history.undoAction();
    });

    hotkeys("ctrl+shift+z", () => {
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
        (await unlisten)();
    });

    async function loadFonts() {
        const fontDir = await resolveResource("res/fonts/");
        const fontFiles = await readDir(fontDir);

        for (const { name, path } of fontFiles) {
            const [fontName] = name?.split(".") || [];

            if (!fontName) return;

            for (let i = 0; i < 10; i++) {
                const font = new FontFace(
                    fontName,
                    `url(${convertFileSrc(path)})`,
                    {
                        weight: `${(i + 1) * 100}`,
                    }
                );
                try {
                    const loadedFont = await font.load();
                    document.fonts.add(loadedFont);
                } catch (error) {
                    console.log("Failed to load font: " + error);
                }
            }
        }
    }
</script>

{#await loadFonts() then}
    <main class="h-full">
        <Timeline vm={timelineVM}></Timeline>
    </main>
{/await}
