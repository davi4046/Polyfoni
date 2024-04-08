<script lang="ts">
    import type TrackGroupVM from "../../../view_models/TrackGroupVM";
    import TrackHeader from "../track_header/TrackHeader.svelte";

    export let vm: TrackGroupVM;

    vm.subscribe(() => (vm = vm));
</script>

{#if vm.state.label}
    <div
        class="flex h-[var(--timeline-track-group-gap)] items-center pl-4 text-sm text-black text-opacity-50"
    >
        {vm.state.label}
    </div>
{/if}
<div class="space-y-[var(--timeline-track-gap)]">
    {#each vm.state.tracks as trackVM (trackVM.id)}
        <TrackHeader vm={trackVM}></TrackHeader>
    {/each}
</div>
