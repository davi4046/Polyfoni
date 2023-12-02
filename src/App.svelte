<script lang="ts">
    import Timeline from "./lib/features/timeline/views/Timeline.svelte";
    import VMFactory from "./lib/features/timeline/factories/VMFactory";
    import makeDemoTimeline from "./lib/features/timeline/dev_utils/makeDemoTimeline";

    let timeline = makeDemoTimeline();

    let timelineVM = VMFactory.createTimelineVM(timeline);
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
