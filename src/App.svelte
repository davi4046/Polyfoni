<script lang="ts">
    import Timeline from "./lib/components/Timeline.svelte";

    import { Controller } from "./lib/controller";

    let controller = new Controller();

    controller.timeline.createVoice("Piano 1");
    controller.timeline.createVoice("Piano 2");
    controller.timeline.createVoice("Piano 3");
    controller.timeline.createVoice("Piano 4");

    let store = controller.timeline.store;
</script>

<main class="h-full">
    <Timeline bind:data={$store}></Timeline>
</main>
