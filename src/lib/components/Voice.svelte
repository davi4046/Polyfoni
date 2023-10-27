<script lang="ts">
    import VoiceShell from "./VoiceShell.svelte";
    import Track from "./Track.svelte";
    import MidiTrack from "./MidiTrack.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;
</script>

<VoiceShell>
    <MidiTrack></MidiTrack>
    {#if !data.isCollapsed}
        {#each data.children as track}
            <Track bind:data={track}></Track>
        {/each}
    {/if}
</VoiceShell>
