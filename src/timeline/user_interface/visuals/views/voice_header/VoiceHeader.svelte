<script lang="ts">
    import type VoiceVM from "../../../view_models/VoiceVM";
    import TrackGroupHeader from "../trackgroup_header/TrackGroupHeader.svelte";

    export let vm: VoiceVM;

    vm.subscribe(() => (vm = vm));
</script>

<div>
    {#each vm.state.trackGroups as trackGroupVM (trackGroupVM.id)}
        <TrackGroupHeader vm={trackGroupVM}></TrackGroupHeader>
    {/each}
</div>
