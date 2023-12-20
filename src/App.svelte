<script lang="ts">
    import Timeline from "./lib/features/timeline/views/Timeline.svelte";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./lib/features/timeline/contexts/TimelineContext";
    import SelectionManager from "./lib/features/timeline/contexts/selection_manager/SelectionManager";
    import HighlightManager from "./lib/features/timeline/contexts/highlight_manager/HighlightManager";
    import createTimelineVM from "./lib/features/timeline/vm_creators/createTimelineVM";
    import MoveManager from "./lib/features/timeline/contexts/move_manager/MoveManager";
    import ShortcutManager from "./lib/shared/shortcut_manager/ShortcutManager";

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
        selectionManager.deleteSelection();
    });
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
