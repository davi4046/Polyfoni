<script lang="ts">
    import Timeline from "./lib/components/Timeline.svelte";

    import { Controller } from "./lib/controller";

    let controller = new Controller();

    controller.timeline.createVoice("Piano 1");
    controller.timeline.createVoice("Piano 2");
    controller.timeline.createVoice("Piano 3");
    controller.timeline.createVoice("Piano 4");

    controller.createKeyboardShortcut(["Delete"], "delete");
    controller.createKeyboardShortcut(["Control", "i"], "insert");
    controller.createKeyboardShortcut(["Control", "x"], "cut");
    controller.createKeyboardShortcut(["Control", "c"], "copy");
    controller.createKeyboardShortcut(["Control", "v"], "paste");

    let store = controller.timeline.store;
</script>

<main class="h-full">
    <Timeline bind:data={$store}></Timeline>
</main>
