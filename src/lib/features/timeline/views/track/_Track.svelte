<script lang="ts">
    import Item from "../item/_Item.svelte";
    import type TrackVM from "../../view_models/track/TrackVM";

    export let trackVM: TrackVM;

    trackVM.subscribe((_) => (trackVM = trackVM));
</script>

<div
    class="relative h-[var(--timeline-track-height)] bg-[var(--timeline-track-color)]"
    data-type="track"
    data-model-id={trackVM.modelId}
>
    {#each trackVM.state.items as itemVM (itemVM.modelId)}
        <Item {itemVM}></Item>
    {/each}
</div>
