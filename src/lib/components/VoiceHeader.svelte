<script lang="ts">
    import VoiceShell from "./VoiceShell.svelte";
    import TrackHeader from "./TrackHeader.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;
</script>

<VoiceShell>
    {#if data.isCollapsed}
        <TrackHeader bind:data={data.children[0]}></TrackHeader>
    {:else}
        {#each data.children as track}
            <TrackHeader bind:data={track}></TrackHeader>
        {/each}
    {/if}
</VoiceShell>
