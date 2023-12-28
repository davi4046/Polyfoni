<script lang="ts">
    import Timeline from "./lib/features/timeline/views/Timeline.svelte";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./lib/features/timeline/context/TimelineContext";
    import SelectionManager from "./lib/features/timeline/context/selection_manager/SelectionManager";
    import HighlightManager from "./lib/features/timeline/context/highlight_manager/HighlightManager";
    import createTimelineVM from "./lib/features/timeline/vm_creators/createTimelineVM";
    import MoveManager from "./lib/features/timeline/context/move_manager/MoveManager";
    import ShortcutManager from "./lib/shared/architecture/shortcut_manager/ShortcutManager";
    import deleteSelectedItems from "./lib/features/timeline/context/operations/deleteSelectedItems";
    import cropHighlightedItems from "./lib/features/timeline/context/operations/cropHighlightedItems";
    import insertEmptyItems from "./lib/features/timeline/context/operations/insertEmptyItems";

    const timeline = makeDemoTimeline();

    const highlightManager = new HighlightManager();
    const selectionManager = new SelectionManager();
    const moveManager = new MoveManager();

    const timelineContext = new TimelineContext(
        timeline,
        highlightManager,
        selectionManager,
        moveManager
    );

    const timelineVM = createTimelineVM(timeline, timelineContext);

    const shortcutManager = new ShortcutManager();

    shortcutManager.register("Delete", () => {
        deleteSelectedItems(timelineContext);
        cropHighlightedItems(timelineContext);
    });

    shortcutManager.register("Insert", () => {
        insertEmptyItems(timelineContext);
    });
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
