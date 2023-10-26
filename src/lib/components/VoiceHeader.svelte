<script lang="ts">
    import VoiceShell from "./VoiceShell.svelte";
    import TrackHeader from "./TrackHeader.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;
</script>

<VoiceShell>
    {#each data.children as track}
        <TrackHeader data={track}></TrackHeader>
    {/each}
</VoiceShell>
