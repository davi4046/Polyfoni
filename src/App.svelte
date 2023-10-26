<script lang="ts">
    import { writable } from "svelte/store";
    import Timeline from "./lib/components/Timeline.svelte";

    import {
        TimelineModel,
        VoiceModel,
        TrackModel,
        ItemModel,
    } from "./lib/models";

    const timeline = writable(
        new TimelineModel(64, [
            new VoiceModel("Piano 1", [
                new TrackModel(0, [
                    new ItemModel(0, 2),
                    new ItemModel(2, 4),
                    new ItemModel(4, 5),
                    new ItemModel(5, 7),
                    new ItemModel(9, 12),
                ]),
                new TrackModel(1, [
                    new ItemModel(1, 3),
                    new ItemModel(3, 6),
                    new ItemModel(7, 9),
                    new ItemModel(11, 12),
                    new ItemModel(12, 13),
                ]),
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
        ])
    );
</script>

<main class="h-full">
    <Timeline bind:data={$timeline}></Timeline>
</main>
