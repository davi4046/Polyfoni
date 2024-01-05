<script lang="ts">
    import type VoiceVM from "../../view_models/voice/VoiceVM";
    import Track from "../track/_Track.svelte";

    export let voiceVM: VoiceVM;

    voiceVM.subscribe(() => (voiceVM = voiceVM));
</script>

<div
    class="space-y-[var(--timeline-track-spacing)] bg-[color:var(--timeline-voice-color)]"
>
    {#each voiceVM.state.tracks as trackVM (trackVM.modelId)}
        <Track {trackVM}></Track>
    {/each}
</div>
