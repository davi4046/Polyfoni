<script lang="ts">
    import Track from "./Track.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;
</script>

<div>
    Voice
    {#each data.children as track}
        <Track data={track}></Track>
    {/each}
</div>
