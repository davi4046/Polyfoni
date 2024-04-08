<script lang="ts">
    import type VoiceVM from "../../../view_models/VoiceVM";
    import TrackGroupHeader from "../group_header/TrackGroupHeader.svelte";

    export let vm: VoiceVM;

    vm.subscribe(() => (vm = vm));

    $: groupsToDisplay = vm.state.isCollapsed
        ? vm.state.trackGroups.slice(0, 1)
        : vm.state.trackGroups;
</script>

<div>
    {#each groupsToDisplay as trackGroupVM (trackGroupVM.id)}
        <TrackGroupHeader vm={trackGroupVM}></TrackGroupHeader>
    {/each}
</div>
