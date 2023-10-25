<script lang="ts">
    import Voice from "./Voice.svelte";

    import { TimelineModel } from "../models";

    export let data: TimelineModel;
</script>

<div>
    {#each data.children as voice}
        <Voice data={voice}></Voice>
    {/each}
</div>
