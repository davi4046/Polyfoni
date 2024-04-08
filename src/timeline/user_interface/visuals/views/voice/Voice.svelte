<script lang="ts">
    import type VoiceVM from "../../../view_models/VoiceVM";
    import TrackGroup from "../group/TrackGroup.svelte";

    export let vm: VoiceVM;

    vm.subscribe(() => (vm = vm));

    $: groupsToDisplay = vm.state.isCollapsed
        ? vm.state.trackGroups.slice(0, 1)
        : vm.state.trackGroups;
</script>

<div class="bg-[color:var(--timeline-voice-color)]">
    {#each groupsToDisplay as trackGroupVM (trackGroupVM.id)}
        <TrackGroup vm={trackGroupVM}></TrackGroup>
    {/each}
</div>
