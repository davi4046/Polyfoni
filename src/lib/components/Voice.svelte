<script lang="ts">
    import VoiceShell from "./VoiceShell.svelte";
    import Track from "./Track.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;
</script>

<VoiceShell>
    {#if data.isCollapsed}
        <Track bind:data={data.children[0]}></Track>
    {:else}
        {#each data.children as track}
            <Track bind:data={track}></Track>
        {/each}
    {/if}
</VoiceShell>
