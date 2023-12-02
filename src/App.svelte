<script lang="ts">
    import Timeline from "./lib/features/timeline/views/Timeline.svelte";
    import VMFactory from "./lib/features/timeline/factories/VMFactory";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";
    import TimelineContext from "./lib/features/timeline/contexts/TimelineContext";
    import SelectionContext from "./lib/features/timeline/contexts/SelectionContext";
    import HighlightContext from "./lib/features/timeline/contexts/HighlightContext";

    let context = new TimelineContext(
        new SelectionContext(),
        new HighlightContext()
    );
    let factory = new VMFactory(context);
    let timeline = makeDemoTimeline();
    let timelineVM = factory.createTimelineVM(timeline);
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
