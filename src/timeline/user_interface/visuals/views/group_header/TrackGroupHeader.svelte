<script lang="ts">
    import type TrackGroupVM from "../../../view_models/TrackGroupVM";
    import TrackHeader from "../track_header/TrackHeader.svelte";
    import PipeEnd from "./assets/PipeEnd.svelte";
    import PipeMid from "./assets/PipeMid.svelte";

    export let vm: TrackGroupVM;

    vm.subscribe(() => (vm = vm));

    $: trackCount = vm.state.tracks.length;
</script>

<div class="space-y-[var(--timeline-track-gap)]">
    {#each vm.state.tracks as trackVM, index (trackVM.id)}
        <TrackHeader vm={trackVM}>
            <span slot="icon">
                {#if index === trackCount - 1}
                    <PipeEnd />
                {:else}
                    <PipeMid />
                {/if}
            </span>
        </TrackHeader>
    {/each}
</div>
