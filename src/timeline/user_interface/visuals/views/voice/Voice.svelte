<script lang="ts">
    import type VoiceVM from "../../../view_models/VoiceVM";
    import TrackGroup from "../group/TrackGroup.svelte";

    export let vm: VoiceVM;

    vm.subscribe(() => (vm = vm));
</script>

<div class="bg-[color:var(--timeline-voice-color)]">
    {#each vm.state.trackGroups as trackGroupVM (trackGroupVM.id)}
        <TrackGroup vm={trackGroupVM}></TrackGroup>
    {/each}
</div>
