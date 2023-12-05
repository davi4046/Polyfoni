<script lang="ts">
    import Timeline from "./lib/features/timeline/views/Timeline.svelte";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./lib/features/timeline/contexts/TimelineContext";
    import SelectionContext from "./lib/features/timeline/contexts/SelectionContext";
    import HighlightContext from "./lib/features/timeline/contexts/HighlightContext";
    import CursorContext from "./lib/features/timeline/contexts/CursorContext";
    import createTimelineVM from "./lib/features/timeline/vm_creators/createTimelineVM";

    let context = new TimelineContext(
        new SelectionContext(),
        new HighlightContext(),
        new CursorContext()
    );
    let timeline = makeDemoTimeline();
    let timelineVM = createTimelineVM(timeline, context);
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
