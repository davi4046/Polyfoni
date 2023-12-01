<script lang="ts">
    import Timeline from "./lib/views/timeline/Timeline.svelte";
    import TimelineModel from "./lib/models/timeline/timeline/TimelineModel";
    import VoiceModel from "./lib/models/timeline/voice/VoiceModel";
    import VMFactory from "./lib/services/VMFactory";
    import VMFactory from "./lib/factories/VMFactory";

    let timeline = new TimelineModel([
        new VoiceModel("Piano 1"),
        new VoiceModel("Piano 2"),
        new VoiceModel("Piano 3"),
    ]);

    let timelineVM = VMFactory.createTimelineVM(timeline);
</script>

<main class="h-full">
    <Timeline {timelineVM}></Timeline>
</main>
