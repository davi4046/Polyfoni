<script lang="ts">
    import Timeline from "./lib/features/timeline/views/Timeline.svelte";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./lib/features/timeline/contexts/TimelineContext";
    import SelectionContext from "./lib/features/timeline/contexts/SelectionContext";
    import HighlightManager from "./lib/features/timeline/contexts/highlight_manager/HighlightManager";
    import createTimelineVM from "./lib/features/timeline/vm_creators/createTimelineVM";
    import MoveManager from "./lib/features/timeline/contexts/move_manager/MoveManager";
    import ShortcutManager from "./lib/shared/shortcut_manager/ShortcutManager";

    const timeline = makeDemoTimeline();

    const highlightCtx = new HighlightManager();
    const selectionCtx = new SelectionContext();
    const moveCtx = new MoveManager();

    const timelineCtx = new TimelineContext(
        timeline,
        highlightCtx,
        selectionCtx,
        moveCtx
    );

    const timelineVM = createTimelineVM(timeline, timelineCtx);

    const shortcutManager = new ShortcutManager();

    shortcutManager.register("Delete", () => {
        selectionCtx.deleteSelection();
    });
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
