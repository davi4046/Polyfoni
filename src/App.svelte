<script lang="ts">
    import Timeline from "./lib/views/timeline/Timeline.svelte";
    import VMFactory from "./lib/factories/VMFactory";
    import makeDemoTimeline from "./lib/dev_utils/makeDemoTimeline";

    let timeline = makeDemoTimeline();

    let timelineVM = VMFactory.createTimelineVM(timeline);
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
