<script lang="ts">
    import VoiceShell from "./VoiceShell.svelte";
    import TrackHeader from "./TrackHeader.svelte";
    import MidiTrackHeader from "./MidiTrackHeader.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;
</script>

<VoiceShell>
    <MidiTrackHeader bind:data></MidiTrackHeader>
    {#if !data.isCollapsed}
        {#each data.children as track}
            <TrackHeader bind:data={track}></TrackHeader>
        {/each}
    {/if}
</VoiceShell>
