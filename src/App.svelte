<script lang="ts">
    import Timeline from "./lib/components/Timeline.svelte";

    import {
        TimelineModel,
        VoiceModel,
        TrackModel,
        ItemModel,
    } from "./lib/models";

    const timeline = new TimelineModel([
        new VoiceModel([
            new TrackModel([
                new ItemModel(0, 2),
                new ItemModel(2, 4),
                new ItemModel(4, 6),
                new ItemModel(6, 8),
            ]),
            new TrackModel([new ItemModel(0, 4), new ItemModel(4, 8)]),
            new TrackModel([new ItemModel(0, 8)]),
        ]),
        new VoiceModel([
            new TrackModel([
                new ItemModel(0, 2),
                new ItemModel(2, 4),
                new ItemModel(4, 6),
                new ItemModel(6, 8),
            ]),
            new TrackModel([new ItemModel(0, 4), new ItemModel(4, 8)]),
            new TrackModel([new ItemModel(0, 8)]),
        ]),
    ]);
</script>

<main>
    <Timeline data={timeline}></Timeline>
</main>
