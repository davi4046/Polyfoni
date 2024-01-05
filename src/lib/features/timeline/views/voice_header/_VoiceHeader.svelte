<script lang="ts">
    import type VoiceVM from "../../view_models/voice/VoiceVM";
    import TrackHeader from "../track_header/_TrackHeader.svelte";

    export let voiceVM: VoiceVM;

    voiceVM.subscribe((_) => (voiceVM = voiceVM));
</script>

<div class="space-y-[var(--timeline-track-spacing)]">
    {#each voiceVM.state.tracks as trackVM (trackVM.modelId)}
        <TrackHeader {trackVM}></TrackHeader>
    {/each}
</div>
