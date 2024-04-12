<script lang="ts">
    import type VoiceGroupVM from "../../../view_models/VoiceGroupVM";
    import Voice from "../voice/Voice.svelte";

    export let vm: VoiceGroupVM;

    vm.subscribe(() => (vm = vm));
</script>

{#each vm.state.voices as voiceVM (voiceVM.id)}
    <Voice vm={voiceVM}></Voice>
{/each}
