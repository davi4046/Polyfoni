<script lang="ts">
    import Timeline from "./lib/features/timeline/views/timeline/Timeline.svelte";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./lib/features/timeline/context/TimelineContext";
    import createTimelineVM from "./lib/features/timeline/vm_creators/createTimelineVM";
    import ShortcutManager from "./lib/shared/architecture/shortcut_manager/ShortcutManager";
    import deleteSelectedItems from "./lib/features/timeline/context/operations/deleteSelectedItems";
    import cropHighlightedItems from "./lib/features/timeline/context/operations/cropHighlightedItems";
    import insertEmptyItems from "./lib/features/timeline/context/operations/insertEmptyItems";
    import selectHighlightedItems from "./lib/features/timeline/context/operations/selectHighlightedItems";

    const timeline = makeDemoTimeline();
    const timelineContext = new TimelineContext(timeline);
    const timelineVM = createTimelineVM(timeline, timelineContext);

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
    <Timeline {timelineVM}></Timeline>
</main>
