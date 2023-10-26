<script lang="ts">
    import VoiceShell from "./VoiceShell.svelte";
    import Track from "./Track.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;
</script>

<VoiceShell>
    {#each data.children as track}
        <Track data={track}></Track>
    {/each}
</VoiceShell>
