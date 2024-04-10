<script lang="ts">
    import type TrackGroupVM from "../../../view_models/TrackGroupVM";
    import DynamicComponent from "../../utils/DynamicComponent.svelte";
    import TrackHeader from "../track_header/TrackHeader.svelte";

    export let vm: TrackGroupVM;

    vm.subscribe(() => (vm = vm));
</script>

{#if !vm.state.noshow}
    <div
        class="flex h-[var(--timeline-track-group-gap)] items-center p-2 text-sm"
    >
        <div class="mr-2 h-6 w-6 overflow-clip">
            <DynamicComponent bind:createComponent={vm.state.createIcon} />
        </div>
        {vm.state.label}
    </div>
{/if}
<div class="space-y-[var(--timeline-track-gap)]">
    {#each vm.state.tracks as trackVM (trackVM.id)}
        <TrackHeader vm={trackVM}></TrackHeader>
    {/each}
</div>
