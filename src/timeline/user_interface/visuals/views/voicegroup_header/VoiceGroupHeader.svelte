<script lang="ts">
    import type VoiceGroupVM from "../../../view_models/VoiceGroupVM";
    import VoiceHeader from "../voice_header/VoiceHeader.svelte";

    export let vm: VoiceGroupVM;

    vm.subscribe(() => (vm = vm));
</script>

<div class="space-y-[var(--timeline-voice-gap)]">
    {#each vm.state.voices as voiceVM (voiceVM.id)}
        <VoiceHeader vm={voiceVM}></VoiceHeader>
    {/each}
</div>
