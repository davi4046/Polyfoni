<script lang="ts">
    import type VoiceVM from "../../../view_models/VoiceVM";
    import Track from "../track/Track.svelte";

    export let voiceVM: VoiceVM;

    voiceVM.subscribe(() => (voiceVM = voiceVM));

    $: tracksToDisplay = voiceVM.state.isCollapsed
        ? voiceVM.state.tracks.slice(0, 1)
        : voiceVM.state.tracks;
</script>

<div
    class="space-y-[var(--timeline-track-gap)] bg-[color:var(--timeline-voice-color)]"
>
    {#each tracksToDisplay as trackVM (trackVM.id)}
        <Track {trackVM}></Track>
    {/each}
</div>
