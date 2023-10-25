<script lang="ts">
    import Timeline from "./lib/components/Timeline.svelte";

    import {
        TimelineModel,
        VoiceModel,
        TrackModel,
        ItemModel,
    } from "./lib/models";

    const timeline = new TimelineModel(64, [
        new VoiceModel("Piano 1", [
            new TrackModel(0),
            new TrackModel(1),
            new TrackModel(2),
            new TrackModel(3),
            new TrackModel(4),
            new TrackModel(5),
        ]),
        new VoiceModel("Piano 2", [
            new TrackModel(0),
            new TrackModel(1),
            new TrackModel(2),
            new TrackModel(3),
            new TrackModel(4),
            new TrackModel(5),
        ]),
    ]);
</script>

<main class="h-full">
    <Timeline data={timeline}></Timeline>
</main>
