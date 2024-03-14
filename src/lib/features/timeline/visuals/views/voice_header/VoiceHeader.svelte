<script lang="ts">
    import type VoiceVM from "../../../view_models/VoiceVM";
    import TrackHeader from "../track_header/TrackHeader.svelte";
    import PipeMid from "./assets/PipeMid.svelte";
    import PipeEnd from "./assets/PipeEnd.svelte";
    import ArrowDown from "./assets/ArrowDown.svelte";

    export let vm: VoiceVM;

    vm.subscribe(() => (vm = vm));

    function toggleCollapsed() {
        vm.state = { isCollapsed: !vm.state.isCollapsed };
    }

    $: trackCount = vm.state.tracks.length;

    $: tracksToDisplay = vm.state.isCollapsed
        ? vm.state.tracks.slice(0, 1)
        : vm.state.tracks;
</script>

<div class="space-y-[var(--timeline-track-gap)]">
    {#each tracksToDisplay as trackVM, index (trackVM.id)}
        <TrackHeader vm={trackVM}>
            <span slot="icon">
                {#if index === 0}
                    <button
                        class="h-full w-full"
                        class:-rotate-90={vm.state.isCollapsed}
                        on:click={(_) => toggleCollapsed()}
                    >
                        <ArrowDown />
                    </button>
                {:else if index === trackCount - 1}
                    <PipeEnd />
                {:else}
                    <PipeMid />
                {/if}
            </span>
        </TrackHeader>
    {/each}
</div>
