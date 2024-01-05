<script lang="ts">
    import type VoiceVM from "../../view_models/voice/VoiceVM";
    import TrackHeader from "../track_header/_TrackHeader.svelte";
    import PipeMid from "./PipeMid.svelte";
    import PipeEnd from "./PipeEnd.svelte";
    import ArrowDown from "./ArrowDown.svelte";

    export let voiceVM: VoiceVM;

    voiceVM.subscribe(() => (voiceVM = voiceVM));

    function toggleCollapsed() {
        voiceVM.state = { isCollapsed: !voiceVM.state.isCollapsed };
    }

    $: trackCount = voiceVM.state.tracks.length;

    $: tracksToDisplay = voiceVM.state.isCollapsed
        ? voiceVM.state.tracks.slice(0, 1)
        : voiceVM.state.tracks;
</script>

<div class="space-y-[var(--timeline-track-spacing)]">
    {#each tracksToDisplay as trackVM, index (trackVM.modelId)}
        <TrackHeader {trackVM}>
            <span slot="icon">
                {#if index === 0}
                    <button
                        class="h-full w-full"
                        class:-rotate-90={voiceVM.state.isCollapsed}
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
