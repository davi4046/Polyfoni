<script lang="ts">
    import type TrackGroupVM from "../../../view_models/TrackGroupVM";
    import Track from "../track/Track.svelte";

    export let vm: TrackGroupVM;

    vm.subscribe(() => (vm = vm));
</script>

<div class="space-y-[var(--timeline-track-gap)]">
    {#each vm.state.tracks as trackVM (trackVM.id)}
        <Track vm={trackVM}></Track>
    {/each}
</div>
