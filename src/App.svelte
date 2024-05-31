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
    import { appWindow } from "@tauri-apps/api/window";
    import type { Event } from "@tauri-apps/api/event";
    import { Store } from "tauri-plugin-store-api";
    import { invoke } from "@tauri-apps/api/tauri";

    const timelineManager = new TimelineManager();

    let projectPath: string | undefined = undefined;

    let currActionIndex = 0;
    let lastSavedAction = 0;

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
            const demoPath = await resolveResource("res/empty_project.plfn");
            const demoData = await readTextFile(demoPath);
            const demoTimeline = createTimelineFromXMLFile(demoData);
            loadTimeline(demoTimeline);

            projectPath = undefined;

            updateWindowTitle();

            const mainStore = new Store(".main.dat");
            mainStore.set("last-project-path", null);
            mainStore.save();
        } catch (error) {
            emit("display-message", {
                message: `Failed to load starter project`,
            });
        }
    }

    async function openFile(filePath: string) {
        const data = await readTextFile(filePath);
        const timeline = createTimelineFromXMLFile(data);
        loadTimeline(timeline);

        projectPath = filePath;

        updateWindowTitle();

        const mainStore = new Store(".main.dat");
        mainStore.set("last-project-path", filePath);
        mainStore.save();
    }

    function updateWindowTitle() {
        const hasUnsavedChanges = currActionIndex !== lastSavedAction;

        appWindow.setTitle(
            `Polyfoni - ${projectPath ? projectPath : "unsaved project"}${
                hasUnsavedChanges ? "*" : ""
            }`
        );
    }

    async function saveProjectAs() {
        if (!timelineManager.timeline) return;

        const path = await save({
            title: "Save As",
            filters: [{ name: "Polyfoni project", extensions: ["plfn"] }],
            defaultPath: projectPath,
        });

        if (!path) return;

        try {
            const xml = createXMLFileFromTimeline(timelineManager.timeline);
            await writeTextFile(path, xml);
            projectPath = path;

            // 1.
            lastSavedAction = currActionIndex;
            // 2.
            updateWindowTitle();

            const mainStore = new Store(".main.dat");
            await mainStore.set("last-project-path", path);
            await mainStore.save();

            emit("display-message", { message: `Saved project to "${path}"` });
        } catch {
            emit("display-message", { message: `Failed to save project"` });
        }
    }

    async function saveProject() {
        if (!timelineManager.timeline) return;

        if (projectPath === undefined) {
            await saveProjectAs();
            return;
        }

        try {
            const xml = createXMLFileFromTimeline(timelineManager.timeline);
            await writeTextFile(projectPath, xml);

            // 1.
            lastSavedAction = currActionIndex;
            // 2.
            updateWindowTitle();

            emit("display-message", {
                message: "Your changes have been saved",
            });
        } catch {
            emit("display-message", { message: "Failed to save changes" });
        }
    }

    let messages: string[] = [];

    const unlistenPromises = [
        listen("new-file", () => {
            loadDemoTimeline();
        }),

        listen("open-file", async (_) => {
            const path = await open({
                title: "Open File",
                filters: [{ name: "Polyfoni project", extensions: ["plfn"] }],
                multiple: false,
                defaultPath: projectPath,
            });

            if (path === undefined) return;

            try {
                openFile(path as string);
            } catch {
                emit("display-message", { message: "Failed to open file" });
            }
        }),

        listen("save-as", saveProjectAs),

        listen("save", saveProject),

        listen("export-to-midi", async (_) => {
            if (!timelineManager.timeline) return;

            const path = await save({
                title: "Export to MIDI",
                filters: [{ name: "MIDI", extensions: ["midi"] }],
            });

            if (!path) return;

            try {
                const buffer = await createMidiFileFromTimeline(
                    timelineManager.timeline
                );
                writeBinaryFile(path, buffer);
            } catch {
                emit("display-message", {
                    message: "Failed to export file to MIDI",
                });
            }
        }),

        listen("display-message", (event) => {
            const payload = event.payload as { message: string };

            messages = [payload.message, ...messages];

            setTimeout(() => {
                messages = messages.toSpliced(-1, 1);
            }, 3000);
        }),

        listen("report-action-index", (event: Event<{ index: number }>) => {
            currActionIndex = event.payload.index;
            updateWindowTitle();
        }),

        listen("reload-app", async () => {
            await saveProject();
            invoke("reload_app");
        }),
    ];

    const loadFontsPromise = loadFonts();

    loadFontsPromise.then(async () => {
        // Try to load the last open project
        const mainStore = new Store(".main.dat");

        const lastProjectPath =
            await mainStore.get<string>("last-project-path");

        if (lastProjectPath) {
            try {
                openFile(lastProjectPath);
            } catch {
                loadDemoTimeline();
            }
        } else {
            loadDemoTimeline();
        }
    });

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
