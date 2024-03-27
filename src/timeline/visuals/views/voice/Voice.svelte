<script lang="ts">
    import type VoiceVM from "../../../view_models/VoiceVM";
    import ItemTrack from "../track/Track.svelte";

    export let vm: VoiceVM;

    vm.subscribe(() => (vm = vm));

    $: tracksToDisplay = vm.state.isCollapsed
        ? vm.state.tracks.slice(0, 1)
        : vm.state.tracks;
</script>

<div
    class="space-y-[var(--timeline-track-gap)] bg-[color:var(--timeline-voice-color)]"
>
    {#each tracksToDisplay as trackVM (trackVM.id)}
        <ItemTrack vm={trackVM} />
    {/each}
</div>
