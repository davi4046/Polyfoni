<script lang="ts">
    import TimelineComponent from "./timeline/user_interface/visuals/views/timeline/Timeline.svelte";
    import { open, save } from "@tauri-apps/api/dialog";
    import createMidiFileFromTimeline from "./timeline/features/import_export/createMidiFileFromTimeline";
    import {
        readTextFile,
        writeBinaryFile,
        writeTextFile,
    } from "@tauri-apps/api/fs";
    import loadFonts from "./utils/app_start/loadFonts";
    import { emit, listen } from "@tauri-apps/api/event";
    import createXMLFileFromTimeline from "./timeline/features/import_export/createXMLFileFromTimeline";
    import createTimelineFromXMLFile from "./timeline/features/import_export/createTimelineFromXMLFile";
    import { TimelineManager } from "./timeline/utils/TimelineManager";
    import { onDestroy } from "svelte";
    import type Timeline from "./timeline/models/timeline/Timeline";
    import { resolveResource } from "@tauri-apps/api/path";

    const timelineManager = new TimelineManager();

    let projectPath: string | undefined = undefined;

    let timelineComponent: TimelineComponent;

    async function loadTimeline(timeline: Timeline) {
        await timelineManager.loadTimeline(timeline);

        timelineComponent?.$destroy();

        const target = document.getElementById("timeline-target")!;

        timelineComponent = new TimelineComponent({
            target: target,
            props: { vm: timelineManager.timelineVM! },
        });
    }

    async function loadDemoTimeline() {
        try {
            const demoPath = await resolveResource("res/demo_project.plfn");
            const demoData = await readTextFile(demoPath);
            const demoTimeline = createTimelineFromXMLFile(demoData);
            loadTimeline(demoTimeline);
        } catch (error) {
            emit("display-message", {
                message: `Failed to load demo project`,
            });
        }
    }

    async function saveAs() {
        if (!timelineManager.timeline) return;

        const path = await save({
            title: "Save As",
            filters: [{ name: "Polyfoni project", extensions: ["plfn"] }],
            defaultPath: projectPath,
        });

        if (!path) return;

        const xml = createXMLFileFromTimeline(timelineManager.timeline);
        writeTextFile(path, xml);
        projectPath = path;

        emit("display-message", { message: `Saved project to "${path}"` });
    }

    let messages: string[] = [];

    const unlistenPromises = [
        listen("open_file", async (_) => {
            const path = await open({
                title: "Open File",
                filters: [{ name: "Polyfoni project", extensions: ["plfn"] }],
                multiple: false,
                defaultPath: projectPath,
            });

            if (!path) return;

            try {
                const data = await readTextFile(path as string);
                const timeline = createTimelineFromXMLFile(data);
                loadTimeline(timeline);
                projectPath = path as string;
            } catch {
                emit("display-message", { message: "Failed to open file" });
            }
        }),

        listen("save_as", saveAs),

        listen("save", async (_) => {
            if (!timelineManager.timeline) return;

            if (projectPath === undefined) {
                saveAs();
                return;
            }
            const xml = createXMLFileFromTimeline(timelineManager.timeline);
            writeTextFile(projectPath, xml);
            emit("display-message", {
                message: `Your changes have been saved`,
            });
        }),

        listen("export_to_midi", async (_) => {
            if (!timelineManager.timeline) return;

            const path = await save({
                title: "Export to MIDI",
                filters: [{ name: "MIDI", extensions: ["midi"] }],
            });

            if (!path) return;

            const buffer = await createMidiFileFromTimeline(
                timelineManager.timeline
            );
            writeBinaryFile(path, buffer);
        }),

        listen("display-message", (event) => {
            const payload = event.payload as { message: string };

            messages = [payload.message, ...messages];

            setTimeout(() => {
                messages = messages.toSpliced(-1, 1);
            }, 3000);
        }),
    ];

    const loadFontsPromise = loadFonts();

    loadFontsPromise.then(loadDemoTimeline);

    onDestroy(async () => {
        const unlistenFuncs = await Promise.all(unlistenPromises);
        unlistenFuncs.forEach((unlisten) => unlisten());
    });
</script>

{#await loadFontsPromise then}
    <main id="timeline-target" class="h-full">
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
