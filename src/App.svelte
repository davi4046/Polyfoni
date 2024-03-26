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
    import StateHierarchyWatcher from "./lib/architecture/StateHierarchyWatcher";
    import Generator from "./lib/features/generation/Generator";
    import TotalHarmonyGenerator from "./lib/features/generation/TotalHarmonyGenerator";

    const timeline = makeDemoTimeline();
    const timelineContext = new TimelineContext(timeline);
    const timelineVM = createTimelineVM(timeline, timelineContext);

    const stateHierarchyWatcher = new StateHierarchyWatcher(timeline);
    const generator = new Generator(stateHierarchyWatcher);
    const thGenerator = new TotalHarmonyGenerator(timeline);

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
</script>

<main class="h-full">
    <Timeline vm={timelineVM}></Timeline>
</main>
