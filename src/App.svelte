<script lang="ts">
    import Timeline from "./lib/features/timeline/views/Timeline.svelte";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./lib/features/timeline/contexts/TimelineContext";
    import SelectionContext from "./lib/features/timeline/contexts/SelectionContext";
    import HighlightContext from "./lib/features/timeline/contexts/HighlightContext";
    import CursorContext from "./lib/features/timeline/contexts/CursorContext";
    import createTimelineVM from "./lib/features/timeline/vm_creators/createTimelineVM";
    import MoveContext from "./lib/features/timeline/contexts/MoveContext";

    const highlightCtx = new HighlightContext();
    const selectionCtx = new SelectionContext();
    const cursorCtx = new CursorContext();
    const moveCtx = new MoveContext();

    const timelineCtx = new TimelineContext(
        highlightCtx,
        selectionCtx,
        cursorCtx,
        moveCtx
    );

    const timeline = makeDemoTimeline();
    const timelineVM = createTimelineVM(timeline, timelineCtx);
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
