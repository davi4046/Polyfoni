<script lang="ts">
    import TrackHeader from "./TrackHeader.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;
</script>

<div class="space-y-2">
    {#each data.children as track}
        <TrackHeader data={track}></TrackHeader>
    {/each}
</div>
